// URL - Uniform Resource Locator

// URL Anatomy

/**
Example URL

https://www.example.com:8080/products/42?category=mobile&sort=price#reviews

Protocol
**https://**

Defines the communication scheme. HTTPS means HTTP secured using TLS.

Hostname
www.example.com

Identifies the host/server you're trying to reach.

Port
8080

Identifies the network port on the host.

Path
/products/42

Identifies the resource or route being requested.

Query string
?category=mobile&sort=price

Carries additional parameters to the server.

Fragment
#reviews

Identifies a location within the resource, often a section of a webpage.
  */

const url =
  "https://example.com:8080/products/42?category=mobile&page=2#reviews";

const myURL = new URL(url);

console.log(myURL.href);
console.log(myURL.protocol);
console.log(myURL.hostname);
console.log(myURL.host);
console.log(myURL.port);
console.log(myURL.pathname);
console.log(myURL.search);
console.log(myURL.hash);
console.log(myURL.origin);
console.log(myURL.searchParams.get("category"));
console.log(myURL.searchParams.get("sort"));

// serach params
const searchParams = new URLSearchParams(myURL.search);

console.log(searchParams.get("category"));
console.log(searchParams.get("page"));

searchParams.set("category", "laptop");

console.log(myURL.href);
