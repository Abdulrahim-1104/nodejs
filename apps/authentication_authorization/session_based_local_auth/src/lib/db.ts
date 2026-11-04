import "dotenv/config";
import { Pool } from "../../node_modules/@types/pg";
import { CONFIG } from "../config/env.config";

export const pool = new Pool({
  connectionString: CONFIG.APP_DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});
