"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    try {
      setLoading(true);
      await axios.get("/api/auth/logout"); // 👈 FIXED
      router.push("/login");
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold 
      disabled:opacity-50 mt-4"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
