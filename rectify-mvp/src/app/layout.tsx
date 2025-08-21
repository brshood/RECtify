import type { Metadata } from "next";
import "./globals.css";
import RegisterServiceWorker from "./register-sw";

export const metadata: Metadata = {
  title: "RECtify - Issue Resolution Platform",
  description: "A comprehensive platform for tracking, managing, and resolving issues efficiently",
  manifest: "/manifest.webmanifest",
  themeColor: "#2563eb",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RECtify",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 min-h-screen">
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
