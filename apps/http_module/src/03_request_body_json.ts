import http = require("http");

const server = http.createServer((req, res) => {
  const chunks: Buffer[] = [];

  req.on("data", (chunk) => {
    console.log(chunk.toString("utf-8"));
    chunks.push(chunk);
  });

  req.on("end", () => {
    const body = Buffer.concat(chunks).toString("utf8");

    console.log(body);

    res.end(body);
  });
});

server.listen(3000);
