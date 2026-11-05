import { SignJWT, jwtVerify } from "jose";
import { CONFIG } from "../config/env.config";
import {
  generateRefreshToken,
  hashRefreshToken,
} from "../service/auth.service";
import { randomUUID } from "crypto";
import { pool } from "./db";

const secret = new TextEncoder().encode(CONFIG.APP_JWT_ACCESS_SECRET);

export const REFRESH_TOKEN_LIFETIME = 30 * 24 * 60 * 60 * 1000;

const ISSUER = "my-express-api";
const AUDIENCE = "my-express-client";

export const refreshCookieOptions = {
  httpOnly: true,
  secure: CONFIG.APP_NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/auth",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export async function generateAccessToken(userId: string) {
  return new SignJWT({})
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ["HS256"],
    issuer: ISSUER,
    audience: AUDIENCE,
  });

  if (!payload.sub) {
    throw new Error("Invalid token");
  }

  return {
    userId: payload.sub,
  };
}

export async function refreshAccessToken(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token required",
      });
    }

    const result = await rotateRefreshToken(refreshToken);

    if (result.status === "reuse_detected") {
      res.clearCookie("refreshToken", refreshCookieOptions);

      return res.status(401).json({
        message: "Refresh token reuse detected. Please login again.",
      });
    }

    if (result.status !== "success") {
      res.clearCookie("refreshToken", refreshCookieOptions);

      return res.status(401).json({
        message: "Invalid or expired refresh token",
      });
    }

    // Create a new access token.
    const accessToken = await generateAccessToken(result.userId);

    // Replace old refresh cookie with new refresh token.
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to refresh authentication",
    });
  }
}

export async function rotateRefreshToken(token: string) {
  const client = await pool.connect();

  const tokenHash = hashRefreshToken(token);

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `SELECT id, user_id, family_id, expires_at, revoked_at
       FROM refresh_tokens
       WHERE token_hash = $1
       FOR UPDATE`,
      [tokenHash]
    );

    const existingToken = result.rows[0];

    if (!existingToken) {
      await client.query("ROLLBACK");

      return {
        status: "invalid" as const,
      };
    }

    // The token was already used or revoked.
    if (existingToken.revoked_at) {
      // Possible refresh-token theft.
      // Revoke every token belonging to this family.
      await client.query(
        `UPDATE refresh_tokens
         SET revoked_at = NOW()
         WHERE family_id = $1
           AND revoked_at IS NULL`,
        [existingToken.family_id]
      );

      await client.query("COMMIT");

      return {
        status: "reuse_detected" as const,
      };
    }

    // Reject expired refresh tokens.
    if (new Date(existingToken.expires_at).getTime() <= Date.now()) {
      await client.query(
        `UPDATE refresh_tokens
         SET revoked_at = NOW()
         WHERE id = $1`,
        [existingToken.id]
      );

      await client.query("COMMIT");

      return {
        status: "expired" as const,
      };
    }

    // Generate replacement token.
    const newToken = generateRefreshToken();

    const newTokenId = randomUUID();

    const newTokenHash = hashRefreshToken(newToken);

    const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_LIFETIME);

    // Store replacement token in the same family.
    await client.query(
      `INSERT INTO refresh_tokens
        (id, user_id, family_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        newTokenId,
        existingToken.user_id,
        existingToken.family_id,
        newTokenHash,
        newExpiresAt,
      ]
    );

    // Invalidate the old token and link it to the replacement.
    await client.query(
      `UPDATE refresh_tokens
       SET revoked_at = NOW(),
           replaced_by_token_id = $1
       WHERE id = $2`,
      [newTokenId, existingToken.id]
    );

    await client.query("COMMIT");

    return {
      status: "success" as const,
      userId: existingToken.user_id as string,
      refreshToken: newToken,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
