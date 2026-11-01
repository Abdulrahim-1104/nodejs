import http = require("http");

const users = [
  { id: 1, name: "Abdulrahman", email: "abdulrahman@nodejs.com" },
  { id: 2, name: "Ahmed", email: "ahmed@nodejs.com" },
  { id: 3, name: "Mohamed", email: "mohamed@nodejs.com" },
];

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/users") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(users));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
  }
});

server.listen(3000);
