import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { generateOtp, hashOtp } from "@/lib/auth/otp";
import { sendEmail } from "@/lib/email/sendEmail";
import { rateLimit } from "@/lib/security/rateLimiter";

export async function POST(req) {
  try {
    await connectDB();

    const { email } = await req.json();
    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // Rate limit per email
    if (!rateLimit(`forgot_email_${email}`, 3, 10 * 60 * 1000)) {
      return Response.json(
        { error: "Too many OTP requests. Try again later." },
        { status: 429 },
      );
    }

    // Rate limit per IP
    if (!rateLimit(`forgot_ip_${ip}`, 20, 10 * 60 * 1000)) {
      return Response.json(
        { error: "Too many attempts from this IP." },
        { status: 429 },
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.emailVerified) {
      return Response.json({ error: "Email not verified" }, { status: 403 });
    }

    // Generate OTP
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    await Otp.create({
      email,
      code: otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send OTP
    await sendEmail({
      to: email,
      subject: "Reset Password OTP",
      html: `
        <h2>Password Reset Code</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
      `,
    });

    return Response.json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
