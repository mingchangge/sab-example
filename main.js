
if (typeof SharedArrayBuffer === 'undefined') {
    console.log('SharedArrayBuffer 不支持');
} else {
    console.log('SharedArrayBuffer 支持');
}

export function SharedArrayBufferExample() {
    // 创建一个4字节的共享内存区
    const sab = new SharedArrayBuffer(4);
    // 创建一个32位整数数组视图
    const int32Array = new Int32Array(sab);
    // 向共享内存区写入数据
    int32Array[0] = 1;
    console.log('Initial value:', int32Array[0]);
    // 创建一个新的线程（Worker）
    const worker = new Worker('worker.js');
    // 向 Worker 线程发送消息，包含共享内存区的引用
    worker.postMessage({ sab });
    // 监听来自 Worker 线程的消息
    worker.onmessage = (event) => {
        console.log('Updated value from worker:', int32Array[0]);
    };
    // 2秒后主线程修改共享内存中的值
    setTimeout(() => {
        int32Array[0] = 2;
        console.log('Updated value in main thread:', int32Array[0]);
    }, 2000);
}

export function SharedArrayBufferAtomicsExample() {
    console.log('SharedArrayBuffer + Atomics 示例开始---------------------------------------------------------------------');
    //配置
    const NUM_WORKERS = 4; // 工作线程数量
    const INCREMENTS_PER_WORKER = 1000; // 每个工作线程要增加的值
    const TOTAL_INCREMENTS = NUM_WORKERS * INCREMENTS_PER_WORKER; // 总增加值
    console.log(`[Main] 启动 ${NUM_WORKERS} 个工作线程, 每次递增 ${INCREMENTS_PER_WORKER} 个值, 总增加值: ${TOTAL_INCREMENTS}`);
    /**
     * 创建共享内存
     * 需要3个32位整数空间
     * - 第0个位置用于非原子计数器
     * - 第1个位置用于原子计数器
     * - 第2个位置用于记录已完成任务的 Worker 数量
     */
    const sab = new SharedArrayBuffer(3 * Int32Array.BYTES_PER_ELEMENT);
    const int32Array = new Int32Array(sab);
    // 启动工作线程-----
    for (let i = 0; i < NUM_WORKERS; i++) {
        const worker = new Worker('worker1.js');
        worker.postMessage({ sab, increments: INCREMENTS_PER_WORKER });
    }
    console.log('[Main] 主线程等待所有工作线程完成...');
    // 等待所有工作线程完成
    /*
        //  Atomics.wait报错：Uncaught TypeError: Atomics.wait cannot be called in this context
        // 这个错误发生的原因是浏览器的安全限制：Atomics.wait()方法只能在Worker线程中调用，不能在主线程（window上下文）中使用。这是为了防止主线程被阻塞而导致用户界面无响应。
        while (Atomics.load(int32Array, 2) < NUM_WORKERS) {
            Atomics.wait(int32Array, 2, Atomics.load(int32Array, 2));
        }
        console.log('[Main] 所有工作线程已完成任务');
        // 最终结果
        console.log('[Main] 验证最终结果...');
        console.log('[Main] 非原子计数器值:', int32Array[0]);
        console.log('[Main] 原子计数器值:', int32Array[1]);
        if(int32Array[0]===int32Array[1]){
            console.log('[Main] 验证结果: 两个计数器值相等！惊喜彩蛋~，可以多次运行试试~~');
        }else{
            console.log('[Main] 验证结果: 两个计数器值不相等！');
        }
    */
    // 使用非阻塞方式等待所有工作线程完成
    let checkTimeoutId;
    function checkWorkersCompletion() {
        if (Atomics.load(int32Array, 2) < NUM_WORKERS) {
            // 使用setTimeout进行非阻塞轮询
            checkTimeoutId = setTimeout(checkWorkersCompletion, 100);
        } else {
            if (checkTimeoutId) {
                clearTimeout(checkTimeoutId);
                checkTimeoutId = null;
            }
            console.log('[Main] 所有工作线程已完成任务');
            // 最终结果
            console.log('[Main] 验证最终结果...');
            console.log('[Main] 非原子计数器值:', int32Array[0]);
            console.log('[Main] 原子计数器值:', int32Array[1]);
            if (int32Array[0] === int32Array[1]) {
                console.log('[Main] 验证结果: 两个计数器值相等！惊喜彩蛋~，可以多次运行试试~~');
            } else {
                console.log('[Main] 验证结果: 两个计数器值不相等！');
            }
        }
    }
    // 启动轮询
    checkWorkersCompletion();
}

export function SharedArrayBufferAtomicsExample2() {
    console.log('SharedArrayBuffer + Atomics 示例开始---------------------------------------------------------------------');
    //配置
    const NUM_WORKERS = 4; // 工作线程数量
    const INCREMENTS_PER_WORKER = 1000; // 每个工作线程要增加的值
    const TOTAL_INCREMENTS = NUM_WORKERS * INCREMENTS_PER_WORKER; // 总增加值
    console.log(`[Main] 启动 ${NUM_WORKERS} 个工作线程, 每次递增 ${INCREMENTS_PER_WORKER} 个值, 总增加值: ${TOTAL_INCREMENTS}`);
    /**
     * 创建共享内存
     * 需要3个32位整数空间
     * - 第0个位置用于非原子计数器
     * - 第1个位置用于原子计数器
     * - 第2个位置用于记录已完成任务的 Worker 数量
     */
    const sab = new SharedArrayBuffer(3 * Int32Array.BYTES_PER_ELEMENT);
    const int32Array = new Int32Array(sab);
    // 处理工作线程完成的回调
    function handleCompletion(event) {
        console.log('[Main] 收到了所有 Worker 完成的信号！',event.data);
        console.log('==========================================');
        // 最终结果
        console.log('[Main] 验证最终结果...');
        console.log('[Main] 非原子计数器值:', int32Array[0]);
        console.log('[Main] 原子计数器值:', int32Array[1]);
        if (int32Array[0] === int32Array[1]) {
            console.log('[Main] 验证结果: 两个计数器值相等！惊喜彩蛋~，可以多次运行试试~~');
        } else {
            console.log('[Main] 验证结果: 两个计数器值不相等！');
        }
    }
    // 启动工作线程-----
    for (let i = 0; i < NUM_WORKERS; i++) {
        const worker = new Worker('worker2.js');
        // 【重要修改】处理工作线程完成的回调
        worker.onmessage = handleCompletion;
        // 发送启动消息，并把 NUM_WORKERS 也传过去
        worker.postMessage({ 
            sab, 
            increments: INCREMENTS_PER_WORKER, 
            numWorkers: NUM_WORKERS, // 工作线程总数
            workerId: i, // 工作线程ID
        });
    }
    console.log('[Main] 主线程等待所有工作线程完成...');   
}