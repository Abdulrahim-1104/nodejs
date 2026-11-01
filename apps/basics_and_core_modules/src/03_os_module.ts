const os = require("os");

// OS module - gives information about the operating system

// returns os platform
console.log("OS platform " + os.platform());

// returns os arch
console.log("OS arch " + os.arch());

// returns os release
console.log("OS release " + os.release());

// returns os uptime
console.log("OS uptime " + os.uptime());

// reuturns cpus length which is no of core
console.log("OS cpus " + os.cpus().length);
