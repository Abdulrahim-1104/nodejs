// DNS - Domain Name System which is used to register the name we can configure the IP address of the server to navigate there
// HTTP - HyperText Transfer Protocol
// Its a protocol(set of rules) for transferring data over the internet
// can communicate in any way but still we need some sort of logic right some set of rules like this structured im going to give or receive data so that is protocol for communication

import http = require("http");

const port = 3000;

const server1 = http.createServer((req, res) => {
  return res.end("Hello World From Server 1");
});

const server2 = http.createServer((req, res) => {
  return res.end("Hello World From Server 2");
});

console.log("Server started with port 3000");
console.log("http://localhost:3000");

server1.listen(0, () => {
  console.log(server1.address());
});

server2.listen(port);
