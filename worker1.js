console.log('Worker 1 thread started');
// 监听来自主线程的消息
self.onmessage = ({ data }) => {
    console.log('Worker 1: Message received from main thread');
    const { sab, increments } = data;
    // Worker 在共享内存上创建自己的视图
    const int32Array = new Int32Array(sab);
    console.log(`[Worker 1] 开始执行 ${increments.toLocaleString()} 次递增操作...`);
    for (let i = 0; i < increments; i++) {
        // 非原子递增,可能会导致竞态条件。经典的"读-改-写" 操作，很容易被其他线程中断
        int32Array[0]++;
        // 原子递增,线程安全。操作不可分割，能保证结果的正确性。
        Atomics.add(int32Array, 1, 1);
    }
    console.log(`[Worker 1] 完成递增操作`);
    // 通知主线程当前 Worker 已完成任务
    Atomics.add(int32Array, 2, 1);
    Atomics.notify(int32Array, 2);
    console.log(`[Worker 1] 通知主线程已完成任务`);
}