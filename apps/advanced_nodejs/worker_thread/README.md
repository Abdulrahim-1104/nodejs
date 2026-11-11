## What is Worker Thread

- Since Node.js is a single-threaded language, if we need to perform heavy tasks, we can use worker threads. Worker threads are separate threads that run in parallel with the main thread. They are useful for performing CPU-intensive tasks without blocking the main thread. Same process with multiple threads with shared memeory and the libuv thread pool is customizable by default it's 4 threads.
-
