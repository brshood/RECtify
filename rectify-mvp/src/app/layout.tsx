import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RECtify - Renewable Energy Trading Platform",
  description: "Trade renewable energy credits, carbon offsets, and sustainable energy tokens on the world's leading platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-900 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
