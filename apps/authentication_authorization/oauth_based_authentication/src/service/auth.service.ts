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
import { CONFIG } from "../config/env.config";
import { googleOAuthClient } from "../config/google-oauth.config";
import { logger } from "../config/logger.config";

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

const oauthCookieOptions = {
  httpOnly: true,
  secure: CONFIG.APP_NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/auth/google/callback",
  maxAge: 10 * 60 * 1000,
};

export const googleLogin = async (req, res, next) => {
  try {
    // 1. Generate state
    const state = randomBytes(32).toString("base64url");

    // 2. Generate nonce
    const nonce = randomBytes(32).toString("base64url");

    // 3. Generate PKCE verifier and challenge
    const { codeVerifier, codeChallenge } =
      await googleOAuthClient.generateCodeVerifierAsync();

    // 4. Temporarily store security values in cookies
    res.cookie("oauth_state", state, oauthCookieOptions);
    res.cookie("oauth_nonce", nonce, oauthCookieOptions);
    res.cookie("oauth_code_verifier", codeVerifier, oauthCookieOptions);

    // 5. Generate Google's authorization URL
    const authorizationUrl = googleOAuthClient.generateAuthUrl({
      response_type: "code",
      scope: ["openid", "email", "profile"],
      state,
      nonce,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      prompt: "select_account",
    });

    console.log("Authorization URL:", authorizationUrl);

    // 6. Redirect the browser to Google
    return res.redirect(authorizationUrl);
  } catch (error) {
    logger.error("Google login failed");
    next(error);
  }
};

const clearOAuthCookies = (res) => {
  const options = {
    httpOnly: true,
    secure: CONFIG.APP_NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/api/auth/google/callback",
  };

  res.clearCookie("oauth_state", options);
  res.clearCookie("oauth_nonce", options);
  res.clearCookie("oauth_code_verifier", options);
};

export const googleCallback = async (req, res, next) => {
  try {
    const { code, state, error } = req.query;

    console.log("Google callback received", { code, state, error });

    // 1. Handle Google authentication cancellation/errors
    if (typeof error === "string") {
      clearOAuthCookies(res);

      return res.status(401).json({
        message: "Google authentication was cancelled or denied",
      });
    }

    // 2. Validate callback parameters
    if (typeof code !== "string" || typeof state !== "string") {
      clearOAuthCookies(res);

      return res.status(400).json({
        message: "Invalid OAuth callback",
      });
    }

    // 3. Retrieve our temporary security values
    const storedState = req.cookies?.oauth_state;
    const storedNonce = req.cookies?.oauth_nonce;
    const codeVerifier = req.cookies?.oauth_code_verifier;

    // 4. Validate state
    if (!storedState || state !== storedState) {
      clearOAuthCookies(res);

      return res.status(403).json({
        message: "Invalid OAuth state",
      });
    }

    if (!storedNonce || !codeVerifier) {
      clearOAuthCookies(res);

      return res.status(400).json({
        message: "OAuth transaction expired",
      });
    }

    // 5. Clear temporary cookies
    // They must not be reused for another callback.
    clearOAuthCookies(res);

    // 6. Exchange authorization code for Google tokens
    const { tokens } = await googleOAuthClient.getToken({
      code,
      codeVerifier,
      redirect_uri: CONFIG.APP_GOOGLE_REDIRECT_URI,
    });

    if (!tokens.id_token) {
      return res.status(401).json({
        message: "Google did not return an ID token",
      });
    }

    // 7. Verify Google's ID token
    const ticket = await googleOAuthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: CONFIG.APP_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        message: "Invalid Google identity",
      });
    }

    // 8. Validate nonce
    if (payload.nonce !== storedNonce) {
      return res.status(401).json({
        message: "Invalid identity token nonce",
      });
    }

    // 9. Validate Google identity information
    if (!payload.sub || !payload.email || payload.email_verified !== true) {
      return res.status(401).json({
        message: "Google account email is not verified",
      });
    }

    const googleSub = payload.sub;
    const email = payload.email.toLowerCase().trim();
    const name = payload.name ?? email.split("@")[0];

    // 10. Find an existing Google account
    const googleUserResult = await pool.query(
      `SELECT id, name, email
       FROM users
       WHERE google_sub = $1`,
      [googleSub]
    );

    let user = googleUserResult.rows[0];

    // 11. If this is a new Google account, register it
    if (!user) {
      // Do not automatically link an existing local account.
      const emailResult = await pool.query(
        `SELECT id FROM users WHERE email = $1`,
        [email]
      );

      if (emailResult.rows.length > 0) {
        return res.status(409).json({
          message:
            "An account with this email already exists. Sign in using your existing method and link Google from account settings.",
        });
      }

      const insertResult = await pool.query(
        `INSERT INTO users (name, email, google_sub)
         VALUES ($1, $2, $3)
         RETURNING id, name, email`,
        [name, email, googleSub]
      );

      user = insertResult.rows[0];
    }

    // 12. Generate YOUR application's access token
    const accessToken = await generateAccessToken(user.id);

    // 13. Generate YOUR application's refresh token
    const { token: refreshToken } = await createRefreshToken(user.id);

    // 14. Set refresh token cookie
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    // 15. Return your application's authentication response
    return res.status(200).json({
      message: "Google authentication successful",
      accessToken,
      user,
    });
  } catch (error) {
    next(error);
  }
};
