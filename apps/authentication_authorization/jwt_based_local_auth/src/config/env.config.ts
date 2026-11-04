import dotenv from "dotenv";
import { IAppConfig } from "../types/config.types";

const result = dotenv.config();

if (result.error) {
  throw result.error;
}

export const CONFIG: IAppConfig = {
  APP_PORT: Number(process.env.APP_PORT || 3000),

  APP_NODE_ENV: String(process.env.APP_NODE_ENV || "development"),

  APP_DATABASE_URL: String(process.env.APP_DATABASE_URL),

  APP_SESSION_SECRET: String(process.env.APP_SESSION_SECRET),

  APP_HASH_SALT: String(process.env.APP_HASH_SALT),

  APP_HOST: String(process.env.APP_HOST),

  APP_JWT_ACCESS_SECRET: String(process.env.APP_JWT_ACCESS_SECRET),

  APP_JWT_REFRESH_SECRET: String(process.env.APP_JWT_REFRESH_SECRET),
};
