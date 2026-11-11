import express from "express";
import redisClient from "./redis.config";

const app = express();

app.use(express.json());

async function startServer() {
  try {
    // Establish Redis connection
    await redisClient.connect();

    console.log("Redis connection established");

    // Start Express
    app.listen(3000, () => {
      console.log("Express running on port 3000");
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();

app.post("/users", async (req, res) => {
  try {
    const { name, age } = req.body;

    // Store user in Redis
    await redisClient.set("user:1", JSON.stringify({ name, age }));

    res.json({
      message: "User stored in Redis",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/users", async (req, res) => {
  try {
    // Retrieve user from Redis
    const user = await redisClient.get("user:1");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(JSON.parse(user as string));
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
