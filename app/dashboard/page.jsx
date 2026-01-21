import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/tokens/access";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export default async function Dashboard() {
  const token = cookies().get("access_token")?.value;

  if (!token) {
    return <h1>Not authenticated</h1>;
  }

  const data = verifyAccessToken(token);

  if (!data) {
    return <h1>Invalid or expired token</h1>;
  }

  await connectDB();
  const user = await User.findById(data.sub);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome, {user.name}</h1>
      <p>Email: {user.email}</p>
      <img src={user.picture} width="100" />
    </div>
  );
}
