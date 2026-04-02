"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiMail, FiLock } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { LiaSpinnerSolid } from "react-icons/lia";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

const StudentSigninForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const router = useRouter();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showOtpInput && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && showOtpInput) {
      setShowOtpInput(false);
      toast.error("OTP expired. Please try again.");
    }
    return () => clearTimeout(timer);
  }, [countdown, showOtpInput]);

  const handleSendOtp = async (email: string) => {
    try {
      setIsSendingOtp(true);
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send OTP");
      }

      setShowOtpInput(true);
      setCountdown(600);
      toast.success("OTP sent to your email");
      return true;
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
      return false;
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!showOtpInput) {
        // First verify credentials
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          toast.error("Invalid credentials");
        } else {
          // If credentials are correct, send OTP
          const otpSent = await handleSendOtp(email);
          if (!otpSent) {
            toast.error("Failed to send OTP");
          }
        }
      } else {
        // Verify OTP
        const response = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code: otp }),
        });

        if (!response.ok) {
          throw new Error("Invalid OTP");
        }

        const data = await response.json();
        if (data.verified) {
          // Complete sign in after OTP verification
          const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });
          
          if (result?.error) {
            throw new Error("Failed to sign in after OTP verification");
          }
          
          toast.success("Signed in successfully");
          router.push("/home");
        } else {
          throw new Error("Invalid OTP");
        }
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/home" });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full">
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-5"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
              disabled={isLoading || isSendingOtp}
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
              disabled={isLoading || isSendingOtp}
            />
          </div>
        </motion.div>

        {showOtpInput && (
          <motion.div 
            className="space-y-3" 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="block w-full px-4 py-3 text-center text-lg border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                maxLength={6}
                pattern="[0-9]*"
                inputMode="numeric"
                required
                disabled={isLoading}
              />
            </div>
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Verification code sent to your email (expires in {formatTime(countdown)})</p>
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="pt-2">
          <button
            type="submit"
            disabled={isLoading || isSendingOtp}
            className={cn(
              "w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed",
              (isLoading || isSendingOtp) && "opacity-70 cursor-not-allowed"
            )}
          >
            {isLoading || isSendingOtp ? (
              <span className="flex items-center justify-center">
                <LiaSpinnerSolid className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                {isSendingOtp ? "Sending OTP..." : "Verifying..."}
              </span>
            ) : showOtpInput ? (
              "Verify OTP"
            ) : (
              "Sign In"
            )}
          </button>
        </motion.div>

        <motion.div className="my-6 flex items-center" variants={itemVariants}>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-sm">OR CONTINUE WITH</span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-all duration-200 shadow-sm hover:shadow"
          >
            <FcGoogle className="h-5 w-5" />
            <span>Sign in with Google</span>
          </button>
        </motion.div>

        <motion.p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400" variants={itemVariants}>
          Don't have an account?{' '}
          <Link 
            href="/signup" 
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
          >
            Sign up
          </Link>
        </motion.p>
      </motion.form>
    </div>
  );
};

export default StudentSigninForm;
