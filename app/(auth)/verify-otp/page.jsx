"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const OtpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

export default function VerifyOtpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email");

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push("/signup");
    }
  }, [email, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(OtpSchema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    try {
      setServerError("");
      setSuccessMessage("");
      setLoading(true);

      const res = await axios.post("/api/auth/verify-otp", {
        email,
        otp: data.otp,
      });

      if (res.status === 200) {
        setSuccessMessage("Email verified successfully! Redirecting...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err) {
      setServerError(err?.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // RESEND OTP
  const resendOtp = async () => {
    try {
      setResendLoading(true);
      setServerError("");
      setSuccessMessage("");

      const res = await axios.post("/api/auth/signup", {
        emailResend: true, // your backend can check this flag
        email,
      });

      if (res.status === 200) {
        setSuccessMessage("A new OTP has been sent to your email.");
      }
    } catch (err) {
      setServerError(err?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Verify Your Email
        </h1>
        <p className="text-gray-400 text-center mb-6 text-sm">
          We sent a 6-digit OTP to{" "}
          <span className="text-indigo-400">{email}</span>.
        </p>

        {serverError && (
          <p className="text-red-400 text-sm text-center mb-3">{serverError}</p>
        )}

        {successMessage && (
          <p className="text-green-400 text-sm text-center mb-3">
            {successMessage}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* OTP Input */}
          <div>
            <label className="text-gray-300 mb-1 block">Enter OTP</label>
            <input
              type="text"
              maxLength={6}
              {...register("otp")}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white 
              text-center tracking-widest text-xl font-mono
              focus:outline-none focus:ring-[1.5px] focus:ring-indigo-500"
              placeholder="123456"
            />
            {errors.otp && (
              <p className="text-red-400 text-sm mt-1">{errors.otp.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 
            text-white font-semibold transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="mt-6 text-center">
          <button
            onClick={resendOtp}
            disabled={resendLoading}
            className="text-indigo-400 hover:text-indigo-300 text-sm disabled:opacity-50"
          >
            {resendLoading ? "Sending OTP..." : "Resend OTP"}
          </button>
        </div>

        <div className="text-center mt-4">
          <a
            href="/signup"
            className="text-gray-400 text-xs hover:text-gray-300"
          >
            Change email
          </a>
        </div>
      </div>
    </div>
  );
}
