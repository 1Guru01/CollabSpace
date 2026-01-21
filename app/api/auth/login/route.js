import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Session from "@/models/Session";
import bcrypt from "bcrypt";

import { createAccessToken } from "@/lib/tokens/access";
import { createRefreshToken, hashRefreshToken } from "@/lib/tokens/refresh";

import { createAuthCookies } from "@/lib/cookies/authCookies";
import { rateLimit } from "@/lib/security/rateLimiter";

export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // IP brute force protection
    if (!rateLimit(`login_ip_${ip}`, 10, 15 * 60 * 1000)) {
      return Response.json(
        { error: "Too many login attempts. Try again later." },
        { status: 429 },
      );
    }

    // Email-based brute force protection
    if (!rateLimit(`login_email_${email}`, 7, 15 * 60 * 1000)) {
      return Response.json(
        { error: "Too many attempts for this email." },
        { status: 429 },
      );
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Check verification
    if (!user.emailVerified) {
      return Response.json({ error: "Email not verified" }, { status: 403 });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Create session
    const refreshToken = createRefreshToken();
    const refreshHash = await hashRefreshToken(refreshToken);

    await Session.create({
      userId: user._id,
      refreshTokenHash: refreshHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    // Access token
    const accessToken = createAccessToken(user._id);

    // Cookies
    const cookies = createAuthCookies(accessToken, refreshToken);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Login successful",
      }),
      {
        status: 200,
        headers: {
          "Set-Cookie": cookies,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
