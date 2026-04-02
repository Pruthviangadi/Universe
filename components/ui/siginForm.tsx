"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { LiaSpinnerSolid } from "react-icons/lia";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

type FormType = "signin" | "signup";

const SiginForm = ({ formType }: { formType: FormType }) => {
  const [userInput, setUserInput] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const router = useRouter();

  const handleSendOtp = async (email: string) => {
    try {
      setIsSendingOtp(true);
      await axios.post("/api/auth/send-otp", { email });
      setShowOtpInput(true);
      setCountdown(600); // Reset countdown to 10 minutes
      toast.success("OTP sent to your email");
    } catch (error) {
      toast.error("Failed to send OTP");
      return false;
    } finally {
      setIsSendingOtp(false);
    }
    return true;
  };

  const handleVerifyOtp = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/auth/verify-otp", {
        email: userInput.email,
        code: otp,
      });
      if (response.data.verified) {
        toast.success("OTP verified successfully");
        return true;
      } else {
        toast.error("Invalid OTP");
        return false;
      }
    } catch (error) {
      toast.error("Failed to verify OTP");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formType === "signin") {
        if (!showOtpInput) {
          // First verify credentials
          const result = await signIn("credentials", {
            email: userInput.email,
            password: userInput.password,
            redirect: false,
          });

          if (result?.error) {
            toast.error("Invalid credentials");
          } else {
            // If credentials are correct, send OTP
            const otpSent = await handleSendOtp(userInput.email);
            if (!otpSent) {
              toast.error("Failed to send OTP");
            }
          }
        } else {
          // Verify OTP
          const isOtpValid = await handleVerifyOtp();
          if (isOtpValid) {
            // Complete sign in after OTP verification
            const result = await signIn("credentials", {
              email: userInput.email,
              password: userInput.password,
              redirect: false,
            });
            
            if (result?.error) {
              toast.error("Failed to sign in");
            } else {
              router.push("/home");
            }
          }
        }
      } else {
        // Handle sign up
        const response = await axios.post("/api/users/signup", userInput);
        if (response.data === "Created New Account") {
          toast.success("Account created successfully");
          router.push("/signin");
        }
      }
    } catch (error) {
      toast.error(formType === "signin" ? "Failed to sign in" : "Failed to create account");
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
    <div className="flex flex-col items-center justify-center gap-4 p-2">
      <form
        className="flex flex-col items-center justify-center gap-4 p-2"
        onSubmit={handleSubmit}
      >
        {formType === "signup" && (
          <input
            type="text"
            className="min-w-0 rounded-lg border-2 border-darkGray bg-transparent p-2"
            placeholder="Full Name"
            value={userInput.name}
            onChange={(e) =>
              setUserInput((prevState) => ({
                ...prevState,
                name: e.target.value,
              }))
            }
            required
          />
        )}
        <input
          type="email"
          className="min-w-0 rounded-lg border-2 border-darkGray bg-transparent p-2"
          placeholder="Email"
          value={userInput.email}
          onChange={(e) =>
            setUserInput((prevState) => ({
              ...prevState,
              email: e.target.value,
            }))
          }
          required
        />
        <input
          type="password"
          className="min-w-0 rounded-lg border-2 border-darkGray bg-transparent p-2"
          placeholder="Password"
          value={userInput.password}
          onChange={(e) =>
            setUserInput((prevState) => ({
              ...prevState,
              password: e.target.value,
            }))
          }
          required
        />
        {showOtpInput && formType === "signin" && (
          <>
            <input
              type="text"
              className="min-w-0 rounded-lg border-2 border-darkGray bg-transparent p-2"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
              required
            />
            <div className="text-center text-sm text-gray-600 dark:text-gray-300">
              <p>Code expires in {formatTime(countdown)}</p>
            </div>
          </>
        )}
        <button
          type="submit"
          className="mt-4 rounded-lg bg-lightGray p-2 px-14 font-semibold dark:bg-darkGray md:w-full"
          disabled={isLoading || isSendingOtp}
        >
          {isLoading || isSendingOtp ? (
            <span className="flex items-center justify-center">
              <LiaSpinnerSolid className="animate-spin" />
            </span>
          ) : showOtpInput && formType === "signin" ? (
            "Verify OTP"
          ) : formType === "signup" ? (
            "Create Account"
          ) : (
            "Sign in"
          )}
        </button>
      </form>
      <p className="-my-3 text-xl font-semibold">or</p>
      <button
        className="flex items-center gap-2 rounded-md bg-extraLightGray p-2 font-bold shadow-xl dark:bg-lightTheme dark:text-darkTheme md:w-full"
        onClick={handleGoogleSignIn}
      >
        <FcGoogle />
        {formType === "signup" ? "Sign Up" : "Sign in"} with Google
      </button>
      <p>
        {formType === "signup"
          ? "Already have an account, "
          : "Don't have an Account , "}
        <Link
          href={formType === "signup" ? "/signin" : "/signup"}
          className="text-blue-500 underline dark:text-blue-300"
        >
          {formType === "signup" ? "Sign in" : "sign up"}
        </Link>
      </p>
    </div>
  );
};

export default SiginForm;
