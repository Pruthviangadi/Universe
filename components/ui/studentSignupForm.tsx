"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { LiaSpinnerSolid } from "react-icons/lia";
import { FcGoogle } from "react-icons/fc";
import { FiUser, FiMail, FiLock, FiHash } from "react-icons/fi";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

const StudentSignupForm = () => {
  const [userInput, setUserInput] = useState({
    name: "",
    email: "",
    usn: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds

  const router = useRouter();

  const handleSendOtp = async () => {
    try {
      setIsSendingOtp(true);
      // First check if the email and USN are pre-approved
      const preApprovalCheck = await axios.post("/api/auth/check-preapproved", {
        email: userInput.email,
        usn: userInput.usn,
      });

      if (!preApprovalCheck.data.isApproved) {
        toast.error("Email and USN do not match our records");
        return;
      }

      // If pre-approved, send OTP
      await axios.post("/api/auth/send-otp", { email: userInput.email });
      setShowOtpInput(true);
      setCountdown(600); // Reset countdown to 10 minutes
      toast.success("OTP sent to your email");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        toast.error("Email and USN do not match our records");
      } else {
        toast.error("Failed to send OTP");
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setIsVerifying(true);
      await axios.post("/api/auth/verify-otp", {
        email: userInput.email,
        code: otp,
      });
      setShowOtpInput(false);
      toast.success("OTP verified successfully");
      return true;
    } catch (error) {
      toast.error("Invalid OTP");
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!showOtpInput) {
      // First send OTP
      await handleSendOtp();
    } else {
      // Verify OTP
      const isOtpValid = await handleVerifyOtp();
      if (isOtpValid) {
        // If OTP is valid, complete sign up
        try {
          const response = await axios.post("/api/users/signup", {
            ...userInput,
            imageUrl: "/default-avatar.png", // Default avatar
            about: "Student at the university",
            tag: userInput.usn, // Using USN as tag
          });

          if (response.data === "Created New Account") {
            toast.success("Account created successfully");
            router.push("/signin");
          }
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 400) {
            toast.error("Account with this email or USN already exists");
          } else {
            toast.error("Failed to create account");
          }
        }
      }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
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
              <FiUser className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={userInput.name}
              onChange={(e) => setUserInput((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Full Name"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={userInput.email}
              onChange={(e) => setUserInput((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email Address"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiHash className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={userInput.usn}
              onChange={(e) => setUserInput((prev) => ({ ...prev, usn: e.target.value }))}
              placeholder="University Seat Number (USN)"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
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
              value={userInput.password}
              onChange={(e) => setUserInput((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Create Password"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
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
            disabled={isVerifying || isSendingOtp}
            className={cn(
              "w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed",
              (isVerifying || isSendingOtp) && "opacity-70 cursor-not-allowed"
            )}
          >
            {isVerifying || isSendingOtp ? (
              <span className="flex items-center justify-center">
                <LiaSpinnerSolid className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                {isSendingOtp ? "Sending OTP..." : "Verifying..."}
              </span>
            ) : showOtpInput ? (
              "Verify OTP"
            ) : (
              "Create Account"
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
            onClick={() => toast("Google signup not implemented in this demo")}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-all duration-200 shadow-sm hover:shadow"
          >
            <FcGoogle className="h-5 w-5" />
            <span>Sign up with Google</span>
          </button>
        </motion.div>

        <motion.p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400" variants={itemVariants}>
          Already have an account?{' '}
          <Link 
            href="/signin" 
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
          >
            Sign in
          </Link>
        </motion.p>
      </motion.form>
    </div>
  );
};

export default StudentSignupForm;