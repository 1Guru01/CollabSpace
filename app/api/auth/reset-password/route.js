import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp";
import bcrypt from "bcrypt";
import { compareOtp } from "@/lib/auth/otp";
import { rateLimit } from "@/lib/security/rateLimiter";

export async function POST(req) {
  try {
    await connectDB();

    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return Response.json(
        { error: "Email, OTP, and new password are required" },
        { status: 400 },
      );
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // 5 attempts per email per 10 minutes
    if (!rateLimit(`reset_password_email_${email}`, 5, 10 * 60 * 1000)) {
      return Response.json(
        { error: "Too many reset attempts. Try again later." },
        { status: 429 },
      );
    }

    // 20 attempts per IP per 10 minutes
    if (!rateLimit(`reset_password_ip_${ip}`, 20, 10 * 60 * 1000)) {
      return Response.json(
        { error: "Too many attempts from this IP." },
        { status: 429 },
      );
    }

    const user = await User.findOne({ email });
    if (!user)
      return Response.json({ error: "User not found" }, { status: 404 });

    if (!user.emailVerified) {
      return Response.json({ error: "Email not verified" }, { status: 403 });
    }

    // Find OTP record
    const otpRecord = await Otp.findOne({ email, used: false }).sort({
      createdAt: -1,
    });

    if (!otpRecord) {
      return Response.json(
        { error: "Invalid or expired OTP" },
        { status: 400 },
      );
    }

    if (otpRecord.expiresAt < new Date()) {
      return Response.json({ error: "OTP expired" }, { status: 400 });
    }

    const isMatch = await compareOtp(otp, otpRecord.code);
    if (!isMatch) {
      return Response.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Update password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Mark OTP used
    otpRecord.used = true;
    await otpRecord.save();

    return Response.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
