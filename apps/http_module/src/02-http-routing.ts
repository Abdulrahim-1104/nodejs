// HTTP routing is used to separate different server logics based on the request route
import http = require("http");

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost:3000");

  const serachParams = new URLSearchParams(url.search);
  console.log(serachParams); // contains all search params // can use get and set method for serach params manipulation
  if (req.method === "GET" && req.url === "/users") {
    res.end("Getting all users");
  } else if (req.method === "GET" && url.pathname.startsWith("/users/")) {
    console.log(url.pathname.split("/"));
    const id = url.pathname.split("/")[2]; // for dynamic url like user/1 , user/2
    res.end(`Getting user with ID: ${id}`);
  } else if (req.method === "GET" && req.url === "/products") {
    res.end("Getting all products");
  } else if (req.method === "POST" && req.url === "/users") {
    res.end("Creating a user");
  } else {
    res.statusCode = 404;
    res.end("Route not found");
  }
});

server.listen(3000);
