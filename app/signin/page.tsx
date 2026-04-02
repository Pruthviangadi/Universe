"use client";

import StudentSigninForm from "@/components/ui/studentSigninForm";
import { useState } from "react";
import HelpModal from "@/components/ui/HelpModal";
import Image from "next/image";

export default function SignInPage() {
  const [helpOpen, setHelpOpen] = useState(false);
  
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6 bg-gray-50 dark:bg-darkTheme">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Logo */}
        <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56">
            <Image
              src="/_6dd78af8-728b-43b4-9083-9b6eb8bb0017-removebg-preview.png"
              alt="UniVerse logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 640px) 8rem, (max-width: 768px) 10rem, 14rem"
            />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-center text-gray-800 dark:text-white">UniVerse</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 text-center">Your gateway to academic excellence</p>
        </div>
        
        {/* Right Side - Form */}
        <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Welcome Back</h2>
            <StudentSigninForm />
            <div className="text-center mt-6">
              <button
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                onClick={() => setHelpOpen(true)}
              >
                Need Help?
              </button>
              <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
