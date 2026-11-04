import { NextFunction } from "express";
import { pool } from "../lib/db";
import { hashPassword, verifyPassword } from "../lib/password";
import { generateSession } from "../lib/session";

interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
}

export const getUserbyEmail = async (email: string) => {
  const result = await pool.query<User>(
    `SELECT id, name, email, password_hash FROM users WHERE email = $1`,
    [email]
  );

  return result.rows[0];
};

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body as any;

  const user = await getUserbyEmail(email);

  if (user) {
    return res.status(400).send({ message: "User already exists" });
  }

  if (!name || !email || !password) {
    return res.status(400).send({ message: "All fields are required" });
  }

  const passwordHash = await hashPassword(password);

  const result = await pool.query<User>(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, password_hash`,
    [name, email.toLowerCase(), passwordHash]
  );

  await generateSession(req, res, result.rows[0]);

  return res.send(result.rows[0]);
};

export const authenticateUser = async (req, res) => {
  const { email, password } = req.body as any;

  const result = await pool.query<User>(
    `SELECT id, name, email, password_hash
     FROM users
     WHERE email = $1`,
    [email.toLowerCase()]
  );

  const user = result.rows[0];

  if (!user) {
    return res.status(401).send({ message: "Invalid credentials" });
  }

  const isPasswordValid = await verifyPassword(password, user.password_hash);

  if (!isPasswordValid) {
    return res.status(401).send({ message: "Invalid credentials" });
  }

  await generateSession(req, res, user);

  res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
  });
};

export async function getMe(req, res) {
  const result = await pool.query<User>(
    `SELECT id, name, email, password_hash FROM users WHERE id = $1`,
    [req.session.userId]
  );

  res.send(result.rows[0]);
}
