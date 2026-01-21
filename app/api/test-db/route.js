import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();
    return Response.json({ status: "ok", message: "DB Connected" });
  } catch (error) {
    return Response.json({
      status: "error",
      message: "DB Connection Failed",
      error: error.message,
    });
  }
}
