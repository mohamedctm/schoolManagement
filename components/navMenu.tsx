"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";

export default function NavMenu() {
  const pathname = usePathname() || ""; // Ensure it's always a string

  const isPageWithNav = (path: string) => {
    return (
      path.startsWith("/employees") ||
      path.startsWith("/students") ||
      path.startsWith("/storage") ||
      path === "/dashboard"
    );
  };

  if (!isPageWithNav(pathname)) return null; // ✅ Hide on other pages

  const handleLogout = () => {
    // Example logout logic (modify as needed)
    fetch("/api/logout", { method: "POST", credentials: "include" }).then(() => {
      window.location.href = "/";
    });
  };

  return (
    <nav className="bg-white text-gray-700 gap-2 p-5 flex justify-between border-b border-gray-300">
      <Link
        href="/dashboard"
        className={`mr-4 flex items-center gap-2 ${
          pathname === "/dashboard" ? "text-purple-800" : ""
        }`}
      >
        <LayoutDashboard size={20} /> Dashboard
      </Link>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-gray-100 text-gray-400 px-4 py-2 rounded hover:bg-red-500 hover:text-white"
      >
        <LogOut size={20} /> Logout
      </button>
    </nav>
  );
}
