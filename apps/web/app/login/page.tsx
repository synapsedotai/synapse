"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { userLoginAtom, mockGoogleLogin } from "@/lib/atoms";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [, login] = useAtom(userLoginAtom);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await mockGoogleLogin();
      
      // Convert Google response to our User type
      login({
        id: response.id,
        name: response.name,
        email: response.email,
        avatar: response.picture,
      });
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <div className="text-center">
            <Image
              src="/synapse-logo.png"
              alt="Synapse"
              width={200}
              height={60}
              className="mx-auto object-contain"
              priority
            />
          </div>

          {/* Welcome Text */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome to Synapse
            </h1>
          </div>

          {/* Google Login Button */}
          <div className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-medium transition-colors"
              variant="outline"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    JR
                  </div>
                  <span>Sign in as demo user Joe Raft</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-gray-100 bg-synapse-beige">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Synapse © 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
