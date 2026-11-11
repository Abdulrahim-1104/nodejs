import cluster from "node:cluster";
import os from "node:os";
import express from "express";

const totalCPUs = os.availableParallelism();

console.log(`Total CPUs: ${totalCPUs}`);

if (cluster.isPrimary) {
  console.log(`Primary process: ${process.pid}`);

  // Create one worker for each available CPU.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} exited`);

    // Restart the worker if it unexpectedly exits.
    cluster.fork();
  });
} else {
  const app = express();

  app.get("/", (req, res) => {
    res.json({
      message: "Hello from worker!",
      processId: process.pid,
    });
  });

  app.listen(3000, () => {
    console.log(`Worker ${process.pid} listening on port 3000`);
  });
}
