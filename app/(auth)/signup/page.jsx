"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SignupSchema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    try {
      setServerError("");
      setLoading(true);

      const res = await axios.post("/api/auth/signup", data);

      if (res.status === 200) {
        router.push(`/verify-otp?email=${data.email}`);
      }
    } catch (err) {
      setServerError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* LEFT SIDE IMAGE (same as login) */}
        <div className="md:w-1/2 relative hidden md:block">
          <img
            src="/signup-side.png"
            className="w-full h-full object-cover"
            alt="signup"
          />
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="w-full md:w-1/2 px-10 py-14">
          <h2 className="text-3xl font-bold text-gray-900">
            Create your account
          </h2>

          <p className="text-gray-500 mt-2 mb-8 text-sm">
            Join CloudSpace and start collaborating with your team instantly.
          </p>

          {serverError && (
            <div className="mb-4 text-red-500 text-sm text-center">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <label className="text-gray-700 block mb-1 text-sm">Name</label>
              <input
                type="text"
                {...register("name")}
                className="w-full px-4 py-3 border rounded-xl bg-white text-gray-900
                focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-gray-700 block mb-1 text-sm">Email</label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-4 py-3 border rounded-xl bg-white text-gray-900
                focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="example@mail.com"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 
              text-white font-semibold transition disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span className="text-gray-500 text-sm">OR</span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>

          {/* Google Signup */}
          <button
            onClick={() => (window.location.href = "/api/auth/google/start")}
            className="relative w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl 
            border border-gray-300 bg-white hover:bg-gray-50 transition shadow-sm active:scale-[0.98]"
          >
            <img src="/google-icon.svg" alt="Google" className="w-6 h-6" />
            <span className="text-gray-700 font-medium text-sm">
              Sign up with Google
            </span>
          </button>

          <p className="text-gray-500 text-sm text-center mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-600 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
