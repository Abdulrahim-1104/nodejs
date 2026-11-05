import { OAuth2Client } from "google-auth-library";
import { CONFIG } from "./env.config";

export const googleOAuthClient = new OAuth2Client(
  CONFIG.APP_GOOGLE_CLIENT_ID,
  CONFIG.APP_GOOGLE_CLIENT_SECRET,
  CONFIG.APP_GOOGLE_REDIRECT_URI
);
