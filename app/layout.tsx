"use client"; // ✅ Make this a client component

import NavMenu from "@/components/navMenu"; 
import { usePathname } from "next/navigation";
import WebsiteMenu  from "@/components/websiteMenu";
import "./globals.css";



export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // ✅ Required for conditional rendering

  // ✅ Hide navigation on certain pages
  const hideNavPages = ["/login", "/register"];
  const showNav = !hideNavPages.includes(pathname);

  // const hideNavPages = ["/login", "/register"];
  const showWebsiteNav = !hideNavPages.includes(pathname);

  return (
    <html lang="en">
      <body className="bg-gray-100">
      {showNav && <NavMenu />} {/* ✅ Conditionally render NavMenu */}
      {showWebsiteNav && <WebsiteMenu />} {/* ✅ Conditionally render NavMenu */}
      <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
