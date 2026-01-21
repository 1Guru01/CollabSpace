"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    try {
      setServerError("");
      setLoading(true);

      const res = await axios.post("/api/auth/login", data, {
        withCredentials: true,
      });

      if (res.status === 200) {
        router.push("/dashboard");
      }
    } catch (err) {
      setServerError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* LEFT SIDE IMAGE */}
        <div className="md:w-1/2 relative hidden md:block">
          <img
            src="/login-side.png" // Change to your image
            className="w-full h-full object-cover"
            alt="login"
          />
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="w-full md:w-1/2 px-10 py-14">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back to CloudSpace
          </h2>

          <p className="text-gray-500 mt-2 mb-8 text-sm">
            Bring your team together with real-time video calling and seamless
            collaboration tools in CloudSpace.
          </p>

          {serverError && (
            <div className="mb-4 text-red-500 text-sm">{serverError}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label className="text-gray-700 block mb-1 text-sm">Email</label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-4 py-3 border rounded-xl bg-white text-gray-900 
                focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="test@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-700 block mb-1 text-sm">
                Password
              </label>
              <input
                type="password"
                {...register("password")}
                className="w-full px-4 py-3 border rounded-xl bg-white text-gray-900 
                focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me toggle */}
            <div className="flex items-center justify-between mt-2">
              <a
                href="/forgot-password"
                className="text-indigo-600 text-sm hover:underline"
              >
                Forgot password?
              </a>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-gray-600 text-sm">Remember me</span>

                <input type="checkbox" className="sr-only peer" />

                <div
                  className="w-10 h-5 bg-gray-300 rounded-full relative 
      peer-checked:bg-indigo-600 transition-colors duration-300"
                >
                  <div
                    className="w-4 h-4 bg-white rounded-full shadow absolute top-0.5 left-0.5 
        peer-checked:translate-x-5 transition-transform duration-300"
                  ></div>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 
              text-white font-semibold transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span className="text-gray-500 text-sm">OR</span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>

          {/* Google Login */}
          <button
            onClick={() => (window.location.href = "/api/auth/google/start")}
            className="relative w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl 
             border border-gray-300 bg-white hover:bg-gray-50 transition 
             shadow-sm active:scale-[0.98]"
          >
            {/* Ripple */}
            <div className="absolute inset-0 rounded-xl pointer-events-none"></div>

            {/* Google Icon */}
            <div className="w-6 h-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="w-full h-full"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                ></path>
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                ></path>
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                ></path>
              </svg>
            </div>

            {/* Label */}
            <span className="text-gray-700 font-medium text-sm">
              Sign in with Google
            </span>
          </button>

          <p className="text-gray-500 text-sm text-center mt-6">
            Don’t have an account?{" "}
            <a href="/signup" className="text-indigo-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
