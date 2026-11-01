import fs = require("node:fs");
import Stream = require("node:stream");

/**
 *
 *  createReadStream() creates a readable stream.
    data fires whenever a chunk is available in flowing mode.
    end fires when all readable data has been consumed.
    highWaterMark controls the stream's buffering threshold, not an absolute maximum chunk size.
 */

// stream using file system module
function readFileUsingStream() {
  const readable = fs.createReadStream("./fileSystem/stream.txt", {
    encoding: "utf8",
    highWaterMark: 16 * 1024, // 16 KB
  });

  readable.on("data", (chunk) => {
    console.log("Received chunk:", chunk);
  });

  readable.on("end", () => {
    console.log("Finished reading the file");
  });

  readable.on("error", (error) => {
    console.error("Error:", error);
  });
}

readFileUsingStream();

// stream using creating own readable stream
function createCustomReadable() {
  let count = 1;

  const readable = new Stream.Readable({
    objectMode: true,

    read() {
      if (count <= 5) {
        this.push({ id: count });
        count++;
      } else {
        this.push(null); // Signals end of stream
      }
    },
  });

  readable.on("data", (chunk) => {
    console.log("Received:", chunk);
  });

  readable.on("end", () => {
    console.log("Readable stream completed");
  });
}

createCustomReadable();

async function readUsingAsyncIterator() {
  const readable = fs.createReadStream("./fileSystem/stream.txt");

  for await (const chunk of readable) {
    console.log("Chunk size:", chunk.length);
  }

  console.log("Finished reading");
}

readUsingAsyncIterator();

function writeFileUsingStream() {
  const writable = fs.createWriteStream("./fileSystem/stream.txt");

  writable.write("Hello ");
  writable.write("Node.js ");
  writable.write("Node.js ");
  writable.end("Streams!");

  writable.on("finish", () => {
    console.log("All data has been written");
  });

  writable.on("error", (error) => {
    console.error(error);
  });
}

writeFileUsingStream();

function createCustomWritable() {
  const writable = new Stream.Writable({
    objectMode: true,

    write(chunk, encoding, callback) {
      console.log("Processing:", chunk);

      // Tell Node.js that this chunk has been processed.
      callback();
    },
  });

  writable.write({ name: "John" });
  writable.write({ name: "Alex" });

  writable.end();

  writable.on("finish", () => {
    console.log("All objects processed");
  });
}

createCustomWritable();

function demonstrateBackpressure() {
  const writable = fs.createWriteStream("./fileSystem/stream.txt", {
    highWaterMark: 16 * 1024,
  });

  for (let i = 0; i < 100_000; i++) {
    const canContinue = writable.write(`This is line number ${i}\n`);

    if (!canContinue) {
      console.log("Backpressure detected!");
    }
  }

  writable.end();
}

demonstrateBackpressure();

async function writeWithBackpressure() {
  const writable = fs.createWriteStream("./fileSystem/stream.txt");

  for (let i = 0; i < 100_000; i++) {
    const canContinue = writable.write(`Line ${i}\n`);

    if (!canContinue) {
      // Stop producing more data until the buffer drains.
      await new Promise<void>((resolve) => {
        writable.once("drain", resolve);
      });

      console.log("Buffer drained. Continue writing.");
    }
  }

  writable.end();

  await new Promise<void>((resolve, reject) => {
    writable.once("finish", resolve);
    writable.once("error", reject);
  });

  console.log("Writing completed");
}

writeWithBackpressure();

function copyFileUsingPipe() {
  const readable = fs.createReadStream("./fileSystem/stream.txt");

  const writable = fs.createWriteStream("./fileSystem/copy.txt");

  readable.pipe(writable);
}

copyFileUsingPipe();

function createCustomDuplex() {
  const duplex = new Stream.Duplex({
    objectMode: true,

    // Data coming OUT of the readable side
    read() {
      this.push("Data from readable side");
      this.push(null);
    },

    // Data coming INTO the writable side
    write(chunk, encoding, callback) {
      console.log("Received:", chunk.toString());

      callback();
    },
  });

  // Consume readable data
  duplex.on("data", (chunk) => {
    console.log("Readable:", chunk.toString());
  });

  // Send data into writable side
  duplex.write("Hello from writable side");

  duplex.end();
}

createCustomDuplex();

function createCustomTransform() {
  const upperCase = new Stream.Transform({
    transform(chunk, encoding, callback) {
      const result = chunk.toString().toUpperCase();

      callback(null, result);
    },
  });

  upperCase.on("data", (chunk) => {
    console.log("Transformed:", chunk.toString());
  });

  upperCase.write("hello ");
  upperCase.write("world");

  upperCase.end();
}

function transformFile() {
  const readable = fs.createReadStream("input.txt");

  const writable = fs.createWriteStream("uppercase.txt");

  const upperCase = new Stream.Transform({
    transform(chunk, encoding, callback) {
      callback(null, chunk.toString().toUpperCase());
    },
  });

  readable.pipe(upperCase).pipe(writable);
}
