import { parentPort } from "node:worker_threads";

console.log("Worker thread started!");

console.log("Worker thread ID:", require("node:worker_threads").threadId);

parentPort?.on("message", (numbers: number[]) => {
  console.log("Worker received:", numbers);

  let total = 0;

  for (const number of numbers) {
    total += number;
  }

  parentPort?.postMessage({ result: total });
});
