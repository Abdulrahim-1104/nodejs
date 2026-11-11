import { createClient } from "redis";

const redisClient = createClient({
  url: "redis://localhost:6379",
});

// Listen for connection errors
redisClient.on("error", (error) => {
  console.error("Redis Error:", error);
});

// Listen for successful connection
redisClient.on("ready", () => {
  console.log("Redis connected successfully!");
});

export default redisClient;
