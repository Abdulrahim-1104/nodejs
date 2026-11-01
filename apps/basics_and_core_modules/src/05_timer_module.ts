// time module - used for timer tasks

// setTimeout - runs after some time
function settingTimeout() {
  console.log("function started");
  const timer = setTimeout(() => {
    console.log("this running after 3 seconds");
  }, 3000);
  console.log("function ended");
}

settingTimeout();

// clearTimeout
function clearingTimeout() {
  console.log("function started");
  const timer = setTimeout(() => {
    console.log("this running after 3 seconds");
  }, 3000);
  console.log("function ended");
  clearTimeout(timer); // this clear the timeout. since this task moved to callback queue and the cleartimeout earse the task before executing
}
clearingTimeout();

// setInterval - run again and again after some delay
// clearInterval - clear the interval

function settingInterval() {
  let count = 0;
  console.log("function started");
  const timer = setInterval(() => {
    console.log("this running after 3 seconds");
    count++;
    if (count === 5) {
      clearInterval(timer);
    }
  }, 3000);
  console.log("function ended");
}

settingInterval();

// setImmediate - runs immediately
function settingImmediate() {
  console.log("function started");
  setImmediate(() => {
    console.log(
      "this running after when callstack have the ready for callback queue"
    );
  });
  console.log("function ended");
}
settingImmediate();

// promise - is an javascript object used for eventual asynchronous operation
// creating promise
const promise = new Promise((resolve, reject) => {
  const success = false;
  if (success) {
    resolve("promise resolved");
  } else {
    reject("promise rejected");
  }
});

promise
  .then((value) => {
    console.log(value);
  })
  .catch((error) => {
    console.log(error);
  });

// create user type

type User = {
  id: number;
  name: string;
  email: string;
};

const user: User = {
  id: 1,
  name: "Abdulrahim",
  email: "abdulrahim@123",
};

// create promise
function verifyItsRahim(user: User): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (user.name === "Abdulrahim") {
        resolve(user);
      } else {
        reject(new Error("User is not Rahim"));
      }
    }, 3000);
  });
}

async function getRahim() {
  const rahimData = await verifyItsRahim(user);
  console.log(rahimData);
}

getRahim();
