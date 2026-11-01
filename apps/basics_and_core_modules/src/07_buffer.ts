// buffer is a type of data that contains the raw binary value which is 0 or 1
// node js buffer display the buffer in hexa format

// creating buffer
const buffer = Buffer.from("abdulrahim");
console.log(buffer);

// converting buffer to string
console.log(buffer.toString("ascii"));

// converting buffer to hexa format
console.log(buffer.toString("hex"));

// converting buffer to base64 format
console.log(buffer.toString("base64"));

// From a string
const a = Buffer.from("Hello");

// From an array
const b = Buffer.from([10, 20, 30]);

// Allocate 5 zero-filled bytes
const c = Buffer.alloc(5);

// Allocate 5 uninitialized bytes
const d = Buffer.allocUnsafe(5);

console.log(c);
console.log(d);

// chunk is a small portion of large size data

const chunk = [Buffer.from("abdul"), Buffer.from("rahim")];
console.log(Buffer.concat(chunk).toString("utf8"));
