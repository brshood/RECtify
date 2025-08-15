import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RECtify - Issue Resolution Platform",
  description: "A comprehensive platform for tracking, managing, and resolving issues efficiently",
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
      </body>
    </html>
  );
}
