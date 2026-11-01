import fs = require("fs");
import path = require("path");

// file system - this module is used to access whole file system in the process
// three ways to work with fs

const FOLDER_PATH = path.join(process.cwd(), "fileSystem");

// creating fodler
fs.mkdirSync(FOLDER_PATH, { recursive: true });

// 1. synchronus file sytem - which is execute one by one
const SYNC_FILE_PATH = path.join(FOLDER_PATH, "fsSyncStyle.txt");
console.log("sync path name -->" + SYNC_FILE_PATH);

console.log("fs sync operation starts");
// fs sync operation
fs.writeFileSync(SYNC_FILE_PATH, "Writing in a file or replacing the content"); // writing
fs.appendFileSync(SYNC_FILE_PATH, " Appending the content"); // appending

const fsSyncData = fs.readFileSync(SYNC_FILE_PATH, "utf-8"); // reading
console.log(fsSyncData);
console.log("fs sync operation ends");

// 2. asynchronus file system - which executes after callstack get free

const ASYNC_FILE_PATH = path.join(FOLDER_PATH, "fsAsyncStyle.txt");
console.log("async path name -->" + ASYNC_FILE_PATH);

console.log("fs async operation starts");
// fs async operation
fs.writeFile(
  ASYNC_FILE_PATH,
  "Writing in a file or replacing the content",
  () => {
    console.log("fs async operation ends");
  }
); // writing
fs.appendFile(ASYNC_FILE_PATH, " Appending the content", () => {}); // appending

fs.readFile(ASYNC_FILE_PATH, "utf-8", (error, data) => {
  if (error) return console.log(error);
  console.log(data);
}); // reading
console.log("fs async operation ends");

// 3. promise - async using promise

const PROMISE_FILE_PATH = path.join(FOLDER_PATH, "fsPromiseStyle.txt");
console.log("promise path name -->" + PROMISE_FILE_PATH);

console.log("fs promise operation starts");
// fs promise operation
fs.promises
  .writeFile(PROMISE_FILE_PATH, "Writing in a file or replacing the content")
  .then(() => {
    console.log("fs promise operation ends");
  }); // writing
fs.promises.appendFile(PROMISE_FILE_PATH, " Appending the content"); // appending

async function readingPromiseFs() {
  const data = await fs.promises.readFile(PROMISE_FILE_PATH, "utf-8");
  console.log(data);
}

readingPromiseFs();
