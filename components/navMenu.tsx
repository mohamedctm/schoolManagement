"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavMenu() {
  const pathname = usePathname();

  const pagesWithNav = ["/dashboard", "/employees", "/students", "/addEmployee", "/editEmployee/[id]"];

  if (!pagesWithNav.includes(pathname)) return null; // ✅ Hide on other pages

  return (
    <nav className="bg-white text-black p-5 flex justify-between border-b border-gray-300">
      <div>
        <Link href="/dashboard" className={`mr-4 ${pathname === "/dashboard" ? "font-bold" : ""}`}>Dashboard</Link>
      </div>
      <Link href="/logout" className="bg-gray-100 text-gray-400 px-4 py-2 rounded hover:bg-red-500 hover:text-white">Logout</Link>
    </nav>
  );
}
