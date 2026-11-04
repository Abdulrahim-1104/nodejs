import session from "express-session";
import { CONFIG } from "../config/env.config";

export const sessionMiddleware = session({
  name: "sid",

  secret: CONFIG.APP_SESSION_SECRET!,

  resave: false,

  saveUninitialized: false,

  cookie: {
    httpOnly: true,
    secure: CONFIG.APP_NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 30,
    path: "/",
  },
});
