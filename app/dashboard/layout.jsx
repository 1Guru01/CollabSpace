import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) return redirect("/login");

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>{user.email}</p>
      <img src={user.picture} width="120" />
      <br /><br />
      <a href="/api/auth/logout">Logout</a>
    </div>
  );
}
