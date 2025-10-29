console.log('Worker 2 thread started------------------------');
// 监听来自主线程的消息
self.onmessage = ({ data }) => {
    const { sab, increments, numWorkers, workerId } = data;
    console.log(`【Worker_${workerId}】 Message received from main thread`, numWorkers, workerId);
    // Worker 在共享内存上创建自己的视图
    const int32Array = new Int32Array(sab);
    console.log(`【Worker_${workerId}】 开始执行 ${increments.toLocaleString()} 次递增操作...`);
    for (let i = 0; i < increments; i++) {
        // 非原子递增,可能会导致竞态条件。经典的"读-改-写" 操作，很容易被其他线程中断
        int32Array[0]++;
        // 原子递增,线程安全
        Atomics.add(int32Array, 1, 1);
    }
    console.log('[Worker 2] 所有工作线程递增操作完成。');
    // 完成任务后,原子递增已完成任务的 Worker 数量
    const previousFinishedCount = Atomics.add(int32Array, 2, 1);
    console.log(`【Worker_${workerId}】 已完成 ${previousFinishedCount + 1} 个工作线程的递增操作。`);
    // 检查是否所有 Worker 都已完成
    if (previousFinishedCount === numWorkers - 1) {
        console.log('[Worker 2] 我是最后一个完成的，正在通知主线程！');
        // 3. 向主线程发送完成信号
        self.postMessage({ status: 'complete' });
    }
}