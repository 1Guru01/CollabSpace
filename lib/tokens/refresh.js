import crypto from "crypto";
import bcrypt from "bcrypt";

export function createRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

export async function hashRefreshToken(refreshToken) {
  return bcrypt.hash(refreshToken, 12);
}

export async function compareRefreshToken(refreshToken, hashedToken) {
  return bcrypt.compare(refreshToken, hashedToken);
}
