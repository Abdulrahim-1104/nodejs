import { Worker } from "node:worker_threads";

console.log("Main thread started!");
console.log("Main PID:", process.pid);

const worker = new Worker("./worker.ts", {
  execArgv: ["--import", "tsx"],
});

console.log("Worker created!");

// Send data to worker
worker.postMessage([10, 20, 30, 40, 50]);

// Receive data from worker
worker.on("message", (message) => {
  console.log("Result from worker:", message);
});

// Listen for worker errors
worker.on("error", (error) => {
  console.error("Worker error:", error);
});

// Listen when worker exits
worker.on("exit", (code) => {
  console.log("Worker exited with code:", code);
});
