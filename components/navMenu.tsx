"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Loader2, Settings } from "lucide-react";

export default function NavMenu() {
  const pathname = usePathname() || ""; // Ensure it's always a string
  const router = useRouter();
  const [loadingLogout, setLoadingLogout] = useState(false); // ✅ Track logout clicks

  const isPageWithNav = (path: string) => {
    return (
      path.startsWith("/employees") ||
      path.startsWith("/students") ||
      path.startsWith("/class") ||
      path.startsWith("/orders") ||
      path.startsWith("/profile") ||
      path.startsWith("/exam") ||
      path === "/dashboard"
    );
  };

  if (!isPageWithNav(pathname)) return null; // ✅ Hide on other pages

  // ✅ Handle Navigation with Loading State
  const handleNavigation = (path: string) => {
    // if (loadingLink) return; // Prevent multiple clicks
    // setLoadingLink(path);
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
      console.log("Logout failed:", error);
    } finally {
      setLoadingLogout(false);
    }
  };

  return (
    <nav className="bg-white gap-4 p-5 flex justify-end border-b border-gray-300">
      {/* Dashboard Link */}
      <button
        onClick={() => handleNavigation("/dashboard")}
        className={`mr-4 flex items-center text-m gap-2 hover:text-blue-900 ${
          pathname === "/dashboard" ? "text-blue-700 font-normal" : "text-gray-600"
        }`}
      >
         <LayoutDashboard size={20} />
        Dashboard
      </button>
      
        {/* profile Link */}
        <button
        onClick={() => handleNavigation("/profile")}
        className={`mr-4 flex items-center text-m gap-2 hover:text-blue-700 ${
          pathname === "/profile" ? "text-blue-600 font-nomal" : "text-gray-600"
        }`}
      >
         <Settings size={20} />
        
      </button>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        disabled={loadingLogout}
        className={`flex items-center text-m gap-2 bg-white text-gray-600 px-4 py-2 rounded hover:bg-red-500 hover:text-white ${
          loadingLogout ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loadingLogout ? <Loader2 className="animate-spin" size={20} /> : <LogOut size={20} />}
        
      </button>
    </nav>
  );
}
