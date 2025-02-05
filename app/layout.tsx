"use client"; // ✅ Make this a client component

import NavMenu from "@/components/navMenu"; 
import { usePathname } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // ✅ Required for conditional rendering

  // ✅ Hide navigation on certain pages
  const hideNavPages = ["/login", "/register"];
  const showNav = !hideNavPages.includes(pathname);

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-gray-100">
        {showNav && <NavMenu />} {/* ✅ Conditionally render NavMenu */}
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
