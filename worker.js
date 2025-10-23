console.log('Worker thread started------------------------------------------------');
// 监听来自主线程的消息
self.onmessage = (event) => {
    console.log('Message received from main thread');
    const { sab } = event.data;
    // 创建一个32位整数数组视图
    const int32Array = new Int32Array(sab);
    // 读取共享内存中的值
    console.log('Received value from main thread:', int32Array[0]);
    // 修改共享内存中的值
    int32Array[0] = 3;
    console.log('Updated value in worker thread:', int32Array[0]);
    // 向主线程发送消息，包含更新后的值
    postMessage({ sab });
    setTimeout(() => {
        console.log("Worker 线程：在 3 秒后，再次读取共享内存...");
        console.log("Worker 线程：读取到的新值为", int32Array[0]); // 应该会打印 100
    }, 5000);
};