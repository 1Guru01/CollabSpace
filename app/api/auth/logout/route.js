import { cookies } from "next/headers";
import { clearAuthCookies } from "@/lib/cookies/authCookies";
import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import bcrypt from "bcrypt";

export async function GET() {
  const cookieStore = await cookies();
  const incomingRefresh = cookieStore.get("refresh_token")?.value;

  // Connect to DB
  await connectDB();

  // Revoke ONLY the matching session
  if (incomingRefresh) {
    const sessions = await Session.find({ revokedAt: null });

    for (const s of sessions) {
      const match = await bcrypt.compare(incomingRefresh, s.refreshTokenHash);
      if (match) {
        s.revokedAt = new Date();
        await s.save();
        break;
      }
    }
  }

  // Clear cookies
  const cleared = clearAuthCookies();

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/login",
      "Set-Cookie": cleared,
    },
  });
}
