import cookieParser from "cookie-parser";
import express, { Router } from "express";
import { version } from "os";
import { z } from "zod";

const PORT = 3000;

// this return an express application instance
const app = express();

// types of middleware
// 1. built-in middleware - like express.json() throws middleware function which is used to parse the json
// 2. third-party middleware - like we can install the package and use that middleware function
// 3. custom middleware - we can write our own middleware function

// app.use() - takes the middleware function
app.use((req, res, next) => {
  console.log("Middleware executed");
  next(); // next() function go to next pipe
});

// this used for /user route alone which is called routing based middleware
app.use("/user", (req, res, next) => {
  console.log("Middleware executed for user route");
  next(); // next() function go to next pipe
});

// this used for any package middleware
app.use(express.json()); // express.json() used for json body parser

// http methods

// get method
app.get("/", (req, res) => {
  res.send("Hello World");
});

// post method
app.post("/", (req, res) => {
  res.send("Hello World");
});

// put method
app.put("/", (req, res) => {
  res.send("Hello World");
});

// delete method
app.delete("/", (req, res) => {
  res.send("Hello World");
});

// can be also chain like this way
app
  .get("/", () => {})
  .post("/", () => {})
  .put("/", () => {})
  .delete("/", () => {});

// Router object used for routing and and be also piped with middleware
const router = Router();
router.get("/", () => {});
router.post("/", () => {});
router.put("/", () => {});
router.delete("/", () => {});

// can create differnt routers like userRouter, productRouter, etc
// its combine routes using the router object can mount by using prefixes
const userRouter = Router();
app.use("/user", userRouter);
app.use("/user", userRouter);
userRouter.get("/", () => {
  console.log("user");
});
userRouter.post("/favorites", () => {});
userRouter.put("/book", () => {});
userRouter.delete("/favorites", () => {});

// URL encoding used to parse the body of the request (kind of passing data in key value)
// convert the character to safely travel through URL
// example : we need to pass (abdul rahim) but space in the url converted to %20 which is one format of convertion called encode and can be also decoded
app.use(express.urlencoded({ extended: true }));

// request object
app.use("/request-object", (req, res, next) => {
  // request object contains various data like req.body, req.params, req.url, etc
  console.log(req.body);
  console.log(req.params);
  console.log(req.url);
  console.log(req.method);

  // req.header contains the meta data of the request
  console.log(req.headers);

  res.send("Request object");
});

// response object
app.use("/response-object", (req, res, next) => {
  console.log(res.header, "res header");

  // setting res header
  res.set("X-App-Name", "MyBackend");

  // getttings headers data
  console.log(res.get("X-App-Name"), "res app name");

  res.status(200).send("Hello World");
});

// cookies
// cookies used to store the data in the client side which is small amount of data and automatically send back the request with attached cookie
app.use("/set-cookies", (req, res, next) => {
  console.log("cookies here !");
  res.cookie("myCookie", "Hello World");

  // httpOnly	JavaScript running in the browser cannot read the cookie.
  // secure	Browser sends it only over HTTPS.
  // sameSite	Controls when cookies are sent in cross-site requests.
  // maxAge	How long the cookie should live, in milliseconds in Express.
  res.cookie("token", "abc123", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 1000,
  });

  res.send("cookie setted");
});

// cookie parser
app.use(cookieParser());
app.use("/read-cookies", (req, res, next) => {
  console.log(req.cookies);
  res.send("cookie read");

  // cookie receive only for this /users path
  res.cookie("userId", "123", {
    path: "/users",
  });
});

// json reponse
app.use("/json-response", (req, res, next) => {
  res.json({ message: "Hello World", data: "abc123" });
});

// HTTP Status Codes

// 1xx --> Informational --> The request was received, and the process is continuing.
// 2xx --> Success --> The requested operation succeeded.
// 3xx --> Redirection --> The client needs to take additional action, usually to go somewhere else.
// 4xx --> Client Error --> The request contains a problem caused by the client.
// 5xx --> Server Error --> The server failed to fulfill a valid request.

app.use("/status-code", (req, res, next) => {
  res.status(200).send("status code");
});

// redirect
app.use("/new-path", (req, res, next) => {
  res.send("Path redirectred to new paths");
});
app.use("/redirect-new-path", (req, res, next) => {
  res.redirect("/new-path");
});

// response can be donwlaoded
app.get("/download", (req, res) => {
  res.download("./files/report.pdf");
});

// can send file
app.get("/document", (req, res) => {
  res.sendFile("/absolute/path/to/report.pdf");
});

// REST API
// Representation state transfer which is an architectural style that defines a set of constraints
// REST is an architectural style that defines a set of constraints
// API is an application programming interface

// Summary: All six REST principles
// Principle	Simple meaning
// Client-Server	Separate frontend and backend responsibilities
// Statelessness	Each request carries the context needed to process it
// Cacheability	Responses indicate whether they can be reused
// Uniform Interface	Communicate using consistent rules
// Layered System	Client doesn't need to know internal server layers
// Code on Demand	Server can optionally send executable code

// API versioning is a api data can be updated with that associative version application sould need to be run
app.use("/api/v1/user", (req, res, next) => {
  const v1 = {
    version: "v1",
    name: "Abdulrahim",
    age: 23,
    gender: "male",
  };
  res.json(v1);
});
app.use("/api/v2/user", (req, res, next) => {
  const v1 = {
    data: {
      version: "v2",
      name: "Abdulrahim",
      age: 23,
      gender: "male",
    },
    meta: {
      hobby: "Music",
      passion: "Coding",
    },
  };
  res.json(v1);
});

// request validation
type TUser = {
  name: string;
  age: number;
  gender: string;
};

// request manual validation
app.use("/request-validation", (req, res, next) => {
  const user: TUser = req.body;
  if (!user.name || !user.age || !user.gender) {
    return res.status(400).json({
      status: "failed",
      message: "name, age, and gender are required",
    });
  }
  res.send("The expected fields satisifies");
});

// using thrid party package ZOD but can be also many packages like this

// creating validation schema
const userSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  age: z.coerce.number().min(18),
});

app.get("/request-zod-validation/:name/:email/:age", (req, res) => {
  const result = userSchema.safeParse(req.params);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.issues,
    });
  }

  const userData = result.data;

  res.status(200).json({
    message: "Validation successful",
    user: userData,
  });
});

// app.listern started the http server and listen the port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("http://localhost:3000");
});
