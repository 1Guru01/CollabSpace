import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Session from "@/models/Session";
import { createAccessToken } from "@/lib/tokens/access";
import { createRefreshToken, hashRefreshToken } from "@/lib/tokens/refresh";
import { createAuthCookies } from "@/lib/cookies/authCookies";

export async function handleGoogleLogin(profile, req) {
  await connectDB();

  // 1. Find or create user
  let user = await User.findOne({ email: profile.email });

  if (!user) {
    user = await User.create({
      name: profile.name,
      email: profile.email,
      picture: profile.picture,
      provider: "google",
      providerId: profile.id,
    });
  }

  // 2. Create refresh token + hashed version
  const refreshToken = createRefreshToken();
  const refreshTokenHash = await hashRefreshToken(refreshToken);

  // 3. Create session (multi-device ready)
  const session = await Session.create({
    userId: user._id,
    refreshTokenHash,
    userAgent: req.headers.get("user-agent") || "Unknown",
    ip: req.headers.get("x-forwarded-for") || "Unknown",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // expires in 30 days
  });

  // 4. Create access token
  const accessToken = createAccessToken(user._id);

  // 5. Create cookies
  const cookies = createAuthCookies(accessToken, refreshToken);

  return {
    user,
    session,
    cookies,
  };
}
