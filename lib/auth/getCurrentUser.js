import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/tokens/access";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  // No access token → not logged in
  if (!token) return null;

  let payload = verifyAccessToken(token);

  // If token expired → try refreshing
  if (!payload) {
    const refreshRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/refresh`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!refreshRes.ok) return null;

    // Try verifying again after refresh
    const cookieStore2 = await cookies();
    const newToken = cookieStore2.get("access_token")?.value;
    payload = verifyAccessToken(newToken);

    if (!payload) return null;
  }

  await connectDB();
  const user = await User.findById(payload.sub);
  return user || null;
}
