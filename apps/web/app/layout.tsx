import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { JotaiProvider } from "@/lib/jotai-provider";
import { UserAuthProvider } from "@/components/user-auth-provider";
import { NexusAuthProvider } from "@/components/nexus-auth-provider";
import { AppContent } from "@/components/app-content";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Synapse",
  description: "A platform for meaningful connections and weekly reflections",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <JotaiProvider>
          <UserAuthProvider>
            <NexusAuthProvider>
              <AppContent>{children}</AppContent>
            </NexusAuthProvider>
          </UserAuthProvider>
        </JotaiProvider>
      </body>
    </html>
  );
}