// event emitter is a way to handle events in node js
// like registering the event and doing something when the event is triggered just like postresql triggers

// the order of listerning and triggering events is important

//Remember these two rules:
// 1. Register listeners before emitting events.
// 2. Register long-lived listeners once, not every time an operation happens.

import EventEmitter = require("events");

const eventEmitter = new EventEmitter();

interface IUser {
  userId: number;
  name: string;
  email: string;
}

const user: IUser = {
  userId: 1,
  name: "Abdulrahim",
  email: "abdulrahim@123",
};

sendWelcomeEmail();
sendVerificationMail();

// consider this is seperate service
// listerning event and triggering
function sendWelcomeEmail() {
  eventEmitter.on("user_created", (user) => {
    console.log(`Welcome email sent to ${user.email}`);
  });
}

// listerning event and triggering
function sendVerificationMail() {
  eventEmitter.on("user_created", (user) => {
    console.log(`Verification email sent to ${user.email}`);
  });
}

// registering event
function createUser(user: IUser) {
  eventEmitter.emit("user_created", user);
}

createUser(user);
