"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Mail, DoorOpen, Info } from "lucide-react";

export default function WebsiteMenu() {
  const pathname = usePathname();

  const isPageWithNav = (path: string) => {
    return (
      path.startsWith("/home") ||
      path.startsWith("/contact") ||
      path.startsWith("/portal") ||
      path === "/about" ||
      path ==="/"
    );
  };

  if (!isPageWithNav(pathname)) return null; // ✅ Hide on other pages

  return (
    <nav className="bg-white text-gray-700 gap-2 p-5 flex justify-between border-b border-gray-300">
      <Link
        href="/dashboard"
        className={`mr-4 flex items-center gap-2 ${
          pathname === "/home" ? "text-purple-800" : ""
        }`}
      >
        <Home size={20} /> Home
      </Link>
      <Link
        href="/about"
        className={`mr-4 flex items-center gap-2 ${
          pathname === "/about" ? "text-purple-800" : ""
        }`}
      >
        <Info size={20} /> about us
      </Link>
      <Link
        href="/contact"
        className={`mr-4 flex items-center gap-2 ${
          pathname === "/contact" ? "text-purple-800" : ""
        }`}
      >
        <Mail size={20} /> contact
      </Link>
      <Link
        href="/"
        className="flex items-center gap-2 bg-gray-100 text-gray-400 px-4 py-2 rounded hover:bg-red-500 hover:text-white"
      >
        <DoorOpen size={20} /> login
      </Link>
    </nav>
  );
}
