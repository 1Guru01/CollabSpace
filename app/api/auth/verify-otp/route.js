import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { compareOtp } from "@/lib/auth/otp";
import { rateLimit } from "@/lib/security/rateLimiter";

export async function POST(req) {
  try {
    await connectDB();

    const { email, otp } = await req.json();

    if (!email || !otp) {
      return Response.json(
        { error: "Email and OTP are required" },
        { status: 400 },
      );
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // Email-based OTP brute force protection
    if (!rateLimit(`verify_email_${email}`, 5, 10 * 60 * 1000)) {
      return Response.json(
        { error: "Too many OTP attempts. Try again later." },
        { status: 429 },
      );
    }

    // IP-based abuse protection
    if (!rateLimit(`verify_ip_${ip}`, 20, 10 * 60 * 1000)) {
      return Response.json(
        { error: "Too many attempts from this IP." },
        { status: 429 },
      );
    }

    // Fetch the user
    const user = await User.findOne({ email });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Already verified?
    if (user.emailVerified) {
      return Response.json({ error: "Already verified" }, { status: 400 });
    }

    // Find latest unused OTP
    const otpRecord = await Otp.findOne({
      email,
      used: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return Response.json({ error: "No valid OTP found" }, { status: 400 });
    }

    // Check expiration
    if (otpRecord.expiresAt < new Date()) {
      return Response.json({ error: "OTP expired" }, { status: 400 });
    }

    // Compare OTP with hashed OTP
    const isMatch = await compareOtp(otp, otpRecord.code);

    if (!isMatch) {
      return Response.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Mark user verified
    user.emailVerified = true;
    await user.save();

    // Mark OTP used
    otpRecord.used = true;
    await otpRecord.save();

    return Response.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
