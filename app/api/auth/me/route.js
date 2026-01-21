import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ user: null }, { status: 401 });
  }

  return Response.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
    },
  });
}
