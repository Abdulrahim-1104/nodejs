import { NextFunction } from "express";
import { pool } from "../lib/db";
import { hashPassword, verifyPassword } from "../lib/password";
import { generateSession } from "../lib/session";
import {
  generateAccessToken,
  REFRESH_TOKEN_LIFETIME,
  refreshCookieOptions,
} from "../lib/jwtManger";
import { createHash, randomBytes, randomUUID } from "crypto";

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

  const existingUser = await getUserbyEmail(email);

  if (existingUser) {
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

  const user = result.rows[0] as User;

  // 6. Generate access token
  const accessToken = await generateAccessToken(user.id);

  const { token: refreshToken } = await createRefreshToken(user.id);

  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  return res.status(200).json({
    success: true,
    accessToken,
  });
};

export const authenticateUser = async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query<User>(
    `SELECT id, name, email, password_hash
       FROM users
       WHERE email = $1`,
    [email.toLowerCase()]
  );

  const user = result.rows[0];

  if (!user) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const isPasswordValid = await verifyPassword(password, user.password_hash);

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const accessToken = await generateAccessToken(user.id);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
};

export async function getMe(req, res) {
  const result = await pool.query<User>(
    `SELECT id, name, email, password_hash FROM users WHERE id = $1`,
    [req.session.userId]
  );

  res.send(result.rows[0]);
}

export async function createRefreshToken(
  userId: string,
  familyId: string = randomUUID()
) {
  const token = generateRefreshToken();

  const tokenId = randomUUID();

  const tokenHash = hashRefreshToken(token);

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_LIFETIME);

  await pool.query(
    `INSERT INTO refresh_tokens
      (id, user_id, family_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [tokenId, userId, familyId, tokenHash, expiresAt]
  );

  return {
    token,
    familyId,
  };
}

export function generateRefreshToken() {
  return randomBytes(32).toString("base64url");
}

export function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function verifyMe(req, res) {
  const userId = req.auth.userId;

  const result = await pool.query<User>(
    `SELECT id, name, email, password_hash FROM users WHERE id = $1`,
    [userId]
  );

  res.send(`I am ${result.rows[0].name}`);
}

export async function logoutUser(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      const tokenHash = hashRefreshToken(refreshToken);

      await pool.query(
        `UPDATE refresh_tokens
         SET revoked_at = NOW()
         WHERE family_id = (
           SELECT family_id
           FROM refresh_tokens
           WHERE token_hash = $1
         )
         AND revoked_at IS NULL`,
        [tokenHash]
      );
    }

    res.clearCookie("refreshToken", refreshCookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Logout failed",
    });
  }
}
