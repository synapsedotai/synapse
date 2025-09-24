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
              <span className="tracking-widest">N E X U S  Portal</span>
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
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Nexus Sign In with Google</span>
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
