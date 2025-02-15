"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Loader2 } from "lucide-react";

export default function NavMenu() {
  const pathname = usePathname() || ""; // Ensure it's always a string
  const router = useRouter();
  const [loadingLink, setLoadingLink] = useState<string | null>(null); // ✅ Track link clicks
  const [loadingLogout, setLoadingLogout] = useState(false); // ✅ Track logout clicks

  const isPageWithNav = (path: string) => {
    return (
      path.startsWith("/employees") ||
      path.startsWith("/students") ||
      path.startsWith("/storage") ||
      path === "/dashboard"
    );
  };

  if (!isPageWithNav(pathname)) return null; // ✅ Hide on other pages

  // ✅ Handle Navigation with Loading State
  const handleNavigation = (path: string) => {
    if (loadingLink) return; // Prevent multiple clicks
    setLoadingLink(path);
    router.push(path);
  };

  // ✅ Handle Logout with Loading State
  const handleLogout = async () => {
    if (loadingLogout) return; // Prevent multiple clicks
    setLoadingLogout(true);

    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoadingLogout(false);
    }
  };

  return (
    <nav className="bg-white text-gray-700 gap-2 p-5 flex justify-between border-b border-gray-300">
      {/* Dashboard Link */}
      <button
        onClick={() => handleNavigation("/dashboard")}
        disabled={loadingLink !== null}
        className={`mr-4 flex items-center gap-2 ${
          pathname === "/dashboard" ? "text-purple-800" : ""
        } ${loadingLink === "/dashboard" ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loadingLink === "/dashboard" ? <Loader2 className="animate-spin" size={20} /> : <LayoutDashboard size={20} />}
        Dashboard
      </button>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        disabled={loadingLogout}
        className={`flex items-center gap-2 bg-gray-100 text-gray-400 px-4 py-2 rounded hover:bg-red-500 hover:text-white ${
          loadingLogout ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loadingLogout ? <Loader2 className="animate-spin" size={20} /> : <LogOut size={20} />}
        Logout
      </button>
    </nav>
  );
}
