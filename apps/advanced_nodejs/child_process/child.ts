import process from "node:process";

console.log("Child process started!");
console.log("Child PID:", process.pid);
console.log("Parent PID:", process.ppid);

// Listen for messages from the parent
process.on("message", (message: { numbers: number[] }) => {
  console.log("Child received:", message);

  // Perform some work
  const result = message.numbers.reduce((total, number) => total + number, 0);

  // Send the result back to the parent
  process.send?.({ result });

  console.log("Child finished calculation");
});
