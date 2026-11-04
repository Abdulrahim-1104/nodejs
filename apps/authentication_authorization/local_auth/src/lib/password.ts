import argon2 from "argon2";
import { CONFIG } from "../config/env.config";

export const hashPassword = async (password: string) => {
  return argon2.hash(password, {
    type: argon2.argon2id,
    salt: Buffer.from(CONFIG.APP_HASH_SALT, "hex"),
  });
};

export const verifyPassword = async (
  password: string,
  passwordHash: string
) => {
  return argon2.verify(passwordHash, password);
};
