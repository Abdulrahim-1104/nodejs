// logging hello world
console.log("Hello world!");

// logging process instance
console.log(process);

// logging process env
console.log("process environment" + process.env);

// logging process argv (usually 0th index contains nodejs path and 1st index contains entire file path)
console.log("process arguments" + process.argv);

// process.exit() - value 0 referes the process completely successfull
//                        - value 1 referes the process exits with error
process.exit(0);
