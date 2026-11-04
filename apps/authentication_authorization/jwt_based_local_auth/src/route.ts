import { Router } from "express";
import authRouter from "./router/auth.router";

const rootRouter = Router();

rootRouter.use(authRouter);

export default rootRouter;
