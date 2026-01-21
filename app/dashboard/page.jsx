import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import LogoutButton from "@/components/LogoutButton";
import { Mail, CheckCircle, XCircle } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) return redirect("/login");

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-white mb-6 tracking-tight">
          Dashboard
        </h1>

        <div className="bg-gray-900/70 border border-gray-800 rounded-3xl shadow-2xl p-8 backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">{user.name}</h2>

              <div className="flex items-center gap-2 text-gray-400 mt-1">
                <Mail size={18} />
                <span>{user.email}</span>
              </div>

              <div className="flex items-center gap-1 mt-1">
                {user.emailVerified ? (
                  <>
                    <CheckCircle size={18} className="text-green-400" />
                    <span className="text-green-400 text-sm">
                      Email Verified
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle size={18} className="text-red-400" />
                    <span className="text-red-400 text-sm">Not Verified</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-800 my-6"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gray-800/40 rounded-2xl p-5 border border-gray-700 flex flex-col gap-2">
              <h3 className="text-sm text-gray-400">Account Created</h3>
              <p className="text-xl text-white font-semibold">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-gray-800/40 rounded-2xl p-5 border border-gray-700 flex flex-col gap-2">
              <h3 className="text-sm text-gray-400">Status</h3>
              <p className="text-xl text-indigo-400 font-semibold">
                Active Session
              </p>
            </div>
          </div>

          <div className="w-full h-px bg-gray-800 my-6"></div>

          <div className="flex justify-end">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
