import http = require("http");

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/external-users") {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users",
        {
          signal: AbortSignal.timeout(100),
        }
      );

      if (!response.ok) {
        throw new Error(`External API returned ${response.status}`);
      }

      const users = await response.json();

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");

      res.end(JSON.stringify(users));
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        res.statusCode = 504;

        res.end(
          JSON.stringify({
            error: "External API timed out",
          })
        );
      } else {
        res.statusCode = 502;

        res.end(
          JSON.stringify({
            error: "Failed to retrieve external users",
          })
        );
      }
    }
  } else {
    res.statusCode = 404;
    res.end("Route not found");
  }
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
