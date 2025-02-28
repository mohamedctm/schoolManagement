"use client"; // ✅ Ensure this remains a client component

import NavMenu from "@/components/navMenu";
import { usePathname } from "next/navigation";
import WebsiteMenu from "@/components/websiteMenu";
import { UserProvider } from "@/context/UserContext";
import { useState, useEffect } from "react";

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // ✅ Required for conditional rendering

  // ✅ Hide navigation on certain pages
  const hideNavPages = ["/login", "/register", "/"];
  const hideNavPagess = ["/login", "/register"];
  const showNav = !hideNavPages.includes(pathname);
  const showWebsiteNav = !hideNavPagess.includes(pathname);
  
  useEffect(() => {
    const isOldBrowser = () => {
      return !(
        "CSS" in window &&
        "supports" in CSS &&
        CSS.supports("display", "grid") &&
        CSS.supports("display", "flex") &&
        CSS.supports("--tw-bg-opacity", "1")
      );
    };

    if (isOldBrowser()) {
      console.warn("⚠️ Old browser detected! Applying fallback styles...");

      const randomColor = () => `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;

      const fallbackStyles = `
        * {
          font-family: Arial, sans-serif;
          box-sizing: border-box;
        }
        body {
          background-color: ${randomColor()};
          color: ${randomColor()};
          padding: 20px;
        }
        div {
          border: 2px solid ${randomColor()};
          padding: 10px;
          margin: 10px 0;
        }
        button {
          background-color: ${randomColor()};
          color: white;
          padding: 10px;
          border: none;
          cursor: pointer;
          font-size: 16px;
          margin: 5px;
        }
        button:hover {
          background-color: ${randomColor()};
        }
        a {
          color: ${randomColor()};
          text-decoration: none;
          font-weight: bold;
        }
        a:hover {
          text-decoration: underline;
        }
        p {
          font-size: 18px;
          line-height: 1.5;
          color: ${randomColor()};
        }
      `;

      const styleElement = document.createElement("style");
      styleElement.innerHTML = fallbackStyles;
      document.head.appendChild(styleElement);
    }
  }, []);
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-gray-100 to-gray-300">
        {showWebsiteNav && <WebsiteMenu />} {/* ✅ Conditionally render Website Menu */}
        
        {showNav ? (
          <UserProvider> {/* ✅ Wrap NavMenu & Authenticated Routes Only */}
            <NavMenu />
            <main className="py-6 px-2">{children}</main>
          </UserProvider>
        ) : (
          <main className="py-6 px-2">{children}</main>
        )}
      </body>
    </html>
  );
}
