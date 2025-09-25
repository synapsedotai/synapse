"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { nexusLoginAtom, mockAdminLogin } from "@/lib/atoms";
import { ShieldCheckIcon, BoltIcon } from "@heroicons/react/24/solid";

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [, nexusLogin] = useAtom(nexusLoginAtom);
  const router = useRouter();

  const handleAdminLogin = async () => {
    setIsLoading(true);
    try {
      const response = await mockAdminLogin();
      
      // Convert Google response to our User type for nexus
      nexusLogin({
        id: response.id,
        name: response.name,
        email: response.email,
        avatar: response.picture,
      });
      
      // Redirect to nexus dashboard
      router.push('/nexus/dashboard');
    } catch (error) {
      console.error('Admin login failed:', error);
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

          {/* Nexus Badge */}
          <div className="flex justify-center">
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 px-4 py-2 text-sm font-bold">
              <BoltIcon className="w-5 h-5 mr-3" />
              <span className="tracking-widest">N E X U S</span>
            </Badge>
          </div>

          {/* Welcome Text */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">
              Executive Access
            </h1>
            <p className="text-gray-600">
              Leadership insights & control
            </p>
          </div>

          {/* Admin Google Login Button */}
          <div className="space-y-4">
            <Button
              onClick={handleAdminLogin}
              disabled={isLoading}
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-purple-200 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    SC
                  </div>
                  <span>Sign in as demo user Sarah Chen</span>
                </div>
              )}
            </Button>

            {/* Back to regular login */}
            <div className="text-center">
              <Button
                variant="ghost"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => router.push('/login')}
              >
                Back to regular login
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-gray-100 bg-synapse-beige">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Synapse Nexus © 2025 • Executive Access Only
          </p>
        </div>
      </footer>
    </div>
  );
}
