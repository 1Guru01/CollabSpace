import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { generateOtp, hashOtp } from "@/lib/auth/otp";
import { sendEmail } from "@/lib/email/sendEmail";
import bcrypt from "bcrypt";
import { rateLimit } from "@/lib/security/rateLimiter";

export async function POST(req) {
  try {
    await connectDB();

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // IP limit: 5 signups per 10 minutes
    if (!rateLimit(`signup_ip_${ip}`, 5, 10 * 60 * 1000)) {
      return Response.json(
        { error: "Too many signup attempts. Try again later." },
        { status: 429 },
      );
    }

    // Email limit: 3 OTPs per hour
    if (!rateLimit(`signup_email_${email}`, 3, 60 * 60 * 1000)) {
      return Response.json(
        { error: "Too many attempts for this email" },
        { status: 429 },
      );
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user && user.emailVerified) {
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    // If user exists but not verified → update data
    if (user && !user.emailVerified) {
      user.name = name;
      user.passwordHash = await bcrypt.hash(password, 10);
      await user.save();
    }

    // If new user
    if (!user) {
      user = await User.create({
        name,
        email,
        passwordHash: await bcrypt.hash(password, 10),
        provider: "credentials",
        providerId: null,
      });
    }

    // GENERATE OTP
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    // Store OTP (hashed)
    await Otp.create({
      email,
      code: otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // SEND OTP EMAIL
    await sendEmail({
      to: email,
      subject: "Your Verification Code",
      html: `
        <h2>Your OTP Code</h2>
        <p>Your verification code is:</p>
        <h1>${otp}</h1>
        <p>It will expire in 10 minutes.</p>
      `,
    });

    return Response.json({
      success: true,
      message: "OTP sent to email",
      userId: user._id,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
