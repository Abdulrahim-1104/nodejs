import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// AES-256 requires exactly 32 bytes.
const ENCRYPTION_KEY = Buffer.from(process.env.MFA_ENCRYPTION_KEY, "base64");

if (ENCRYPTION_KEY.length !== 32) {
  throw new Error("MFA_ENCRYPTION_KEY must decode to exactly 32 bytes");
}

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

export function encryptMfaSecret(secret: string, userId: string): string {
  // Generate a new random IV for every encryption.
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  // Bind this encrypted value to its owner.
  cipher.setAAD(Buffer.from(userId, "utf8"));

  const encrypted = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Store all required decryption information together.
  return [
    "v1",
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptMfaSecret(
  encryptedValue: string,
  userId: string
): string {
  const parts = encryptedValue.split(".");

  const [version, ivEncoded, tagEncoded, dataEncoded] = parts;

  if (
    parts.length !== 4 ||
    version !== "v1" ||
    !ivEncoded ||
    !tagEncoded ||
    !dataEncoded
  ) {
    throw new Error("Invalid encrypted MFA secret format");
  }

  const iv = Buffer.from(ivEncoded, "base64url");
  const authTag = Buffer.from(tagEncoded, "base64url");
  const encrypted = Buffer.from(dataEncoded, "base64url");

  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error("Invalid encrypted MFA secret");
  }

  try {
    const decipher = createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    // The same user ID must be supplied during decryption.
    decipher.setAAD(Buffer.from(userId, "utf8"));

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch {
    throw new Error("Unable to decrypt MFA secret");
  }
}
