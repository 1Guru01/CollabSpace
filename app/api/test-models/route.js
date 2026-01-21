import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Session from "@/models/Session";

export async function GET() {
  try {
    await connectDB();

    const testUser = await User.create({
      name: "Test User",
      email: "test@example.com",
      picture: "",
      provider: "google",
      providerId: "1234567890",
    });

    return Response.json({
      message: "Models OK",
      userCreated: testUser.email,
    });
  } catch (error) {
    return Response.json(
      { message: "FAILED", error: error.message },
      { status: 500 }
    );
  }
}
