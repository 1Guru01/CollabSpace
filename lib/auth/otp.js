import crypto from "crypto";
import bcrypt from "bcrypt";

export function generateOtp() {
  // 6-digit numeric OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function hashOtp(otp) {
  return bcrypt.hash(otp, 10);
}

export async function compareOtp(otp, hash) {
  return bcrypt.compare(otp, hash);
}
