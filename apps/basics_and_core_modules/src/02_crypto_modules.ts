import crypto = require("crypto");
// cryptography means protecting informations by transforming it to only authorized persons using keys
// crypto modules is used to provide a crypto functionalitites

// hashing - converts the input data into the fixed size of bytes output but it cant reverse its an one way process
// the same content of two input hashes looks identical
const hash = crypto.createHash("sha256").update("Its me rahim").digest("hex");

console.log("hash " + hash);

// hmac is same as hashing but we can use the seceret key to hash and then able to verify
const secret = "my-super-secret-key";
const message = "Hello World";

const receivedTag = crypto
  .createHmac("sha256", secret)
  .update(message)
  .digest();

const calculatedTag = crypto
  .createHmac("sha256", secret)
  .update(message)
  .digest();

const isValid =
  receivedTag.length === calculatedTag.length &&
  crypto.timingSafeEqual(receivedTag, calculatedTag);

console.log("is Valid", isValid);

// producing random bytes
const randomBytes = crypto.randomBytes(32).toString("hex");
console.log("randomBytes " + randomBytes);

// producing random uuid's
const uudi = crypto.randomUUID();
console.log("uudi " + uudi);
