import { Router } from "express";
import {
  authenticateUser,
  getMe,
  googleCallback,
  googleLogin,
  logoutUser,
  registerUser,
  verifyMe,
} from "../service/auth.service";
import { ROUTES } from "../router";
import { loginSchema, registerSchema } from "../validation/auth.validation";
import { validateBody } from "../middleware/validator.middleware";
import { verifyAuth } from "../middleware/auth.middleware";

const authRouter = Router();

authRouter.post(
  ROUTES.AUTH.AUTH_REGISTER,
  validateBody(registerSchema),
  registerUser
);

authRouter.post(
  ROUTES.AUTH.AUTH_LOGIN,
  validateBody(loginSchema),
  authenticateUser
);

authRouter.get(ROUTES.AUTH.AUTH_VERIFY_ME, verifyAuth, verifyMe);

authRouter.get(ROUTES.AUTH.AUTH_GET_ME, verifyAuth, getMe);

authRouter.post(ROUTES.AUTH.AUTH_LOGOUT, verifyAuth, logoutUser);

// Google OAuth routes
authRouter.get(ROUTES.AUTH.AUTH_GOOGLE_LOGIN, googleLogin);

authRouter.get(ROUTES.AUTH.AUTH_GOOGLE_CALLBACK, googleCallback);
export default authRouter;
