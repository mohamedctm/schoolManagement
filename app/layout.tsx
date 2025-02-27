"use client"; // ✅ Make this a client component

import NavMenu from "@/components/navMenu"; 
import { usePathname } from "next/navigation";
import WebsiteMenu  from "@/components/websiteMenu";
import {UserProvider} from "@/context/UserContext";
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
      <body className="bg-gradient-to-b from-gray-100 to-gray-300">
      {showNav && <NavMenu />} {/* ✅ Conditionally render NavMenu */}
      {showWebsiteNav && <WebsiteMenu />} {/* ✅ Conditionally render NavMenu */}
      <UserProvider><main className="py-6 px-2">{children}</main></UserProvider>
      </body>
    </html>
  );
}
