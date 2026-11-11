import { fork } from "node:child_process";

console.log("Parent process started!");
console.log("Parent PID:", process.pid);

// Create a separate Node.js process
const child = fork("./child.ts", {
  execArgv: ["--import", "tsx"],
});

console.log("Child PID:", child.pid);

// Send data to the child
child.send({
  numbers: [10, 20, 30, 40, 50],
});

// Receive the result
child.on("message", (message) => {
  console.log("Result received from child:", message);
});

// Listen for process exit
child.on("exit", (code, signal) => {
  console.log("Child process exited");
  console.log("Exit code:", code);
  console.log("Signal:", signal);
});
