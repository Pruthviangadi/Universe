"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { LiaSpinnerSolid } from "react-icons/lia";

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      router.push("/signin");
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, router]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsVerifying(true);
      await axios.post("/api/auth/verify-otp", { email, code: otp });
      toast.success("OTP verified successfully");
      router.push("/home");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        toast.error("Invalid or expired OTP");
      } else {
        toast.error("Failed to verify OTP");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;

    try {
      setIsResending(true);
      await axios.post("/api/auth/send-otp", { email });
      setCountdown(600); // Reset countdown to 10 minutes
      toast.success("OTP resent successfully");
    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Verify Your Email</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Enter the 6-digit code sent to {email}
          </p>
        </div>

        <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
          <div>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full rounded-lg border-2 border-gray-300 p-3 text-center text-lg focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
              required
            />
          </div>

          <div className="text-center text-sm text-gray-600 dark:text-gray-300">
            {countdown > 0 ? (
              <p>Code expires in {formatTime(countdown)}</p>
            ) : (
              <p className="text-red-500">Code has expired</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isVerifying || countdown === 0}
            className="w-full rounded-lg bg-blue-500 p-3 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isVerifying ? (
              <span className="flex items-center justify-center">
                <LiaSpinnerSolid className="mr-2 animate-spin" />
                Verifying...
              </span>
            ) : (
              "Verify OTP"
            )}
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResending || countdown > 0}
            className="w-full rounded-lg border-2 border-gray-300 p-3 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {isResending ? (
              <span className="flex items-center justify-center">
                <LiaSpinnerSolid className="mr-2 animate-spin" />
                Resending...
              </span>
            ) : (
              "Resend OTP"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTPPage; 