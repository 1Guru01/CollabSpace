import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { createAccessToken } from "@/lib/tokens/access";
import {
  createRefreshToken,
  hashRefreshToken,
  compareRefreshToken,
} from "@/lib/tokens/refresh";
import { createAuthCookies } from "@/lib/cookies/authCookies";

export async function GET(req) {
  try {
    await connectDB();

    // 1. Get refresh token from cookies
    const cookieStore = await cookies();
    const incomingRefreshToken = cookieStore.get("refresh_token")?.value;

    if (!incomingRefreshToken) {
      return Response.json(
        { error: "No refresh token provided" },
        { status: 401 }
      );
    }

    // 2. Find session with matching hashed token
    const sessions = await Session.find({
      revokedAt: null,
    });

    let session = null;

    for (const s of sessions) {
      const isMatch = await compareRefreshToken(
        incomingRefreshToken,
        s.refreshTokenHash
      );
      if (isMatch) {
        session = s;
        break;
      }
    }

    if (!session) {
      return Response.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // 3. Check if session is expired
    if (session.expiresAt < new Date()) {
      return Response.json(
        { error: "Session expired" },
        { status: 401 }
      );
    }

    // 4. Rotate refresh token
    const newRefreshToken = createRefreshToken();
    const newRefreshHash = await hashRefreshToken(newRefreshToken);

    session.refreshTokenHash = newRefreshHash;
    session.expiresAt = new Date(Date.now() + 30 * 86400000); // +30 days
    await session.save();

    // 5. Create new access token
    const accessToken = createAccessToken(session.userId);

    // 6. Create updated cookies
    const newCookies = createAuthCookies(accessToken, newRefreshToken);

    return new Response(
      JSON.stringify({ success: true, rotated: true }),
      {
        status: 200,
        headers: {
          "Set-Cookie": newCookies,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
