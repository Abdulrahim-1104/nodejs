import path = require("path");

// path moduel - gives information about the path

// returns the current working directory
console.log("current working directory --->" + __dirname);

// returns the base name of the current module
console.log("base name of the current module --->" + __filename);

// path joins - path.join only creates string path
console.log("path joins --->" + path.join(__dirname, "01_process.object.ts"));

// path dirname
console.log("path dirname --->" + path.dirname(__filename));

// path basename
console.log("path basename --->" + path.basename(__filename));

// path extname
console.log("path extname --->" + path.extname(__filename));

// in simple words path can give the most of the access for the filesystem
