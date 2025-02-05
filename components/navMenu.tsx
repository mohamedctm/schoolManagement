"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavMenu() {
  const pathname = usePathname();

  const pagesWithNav = ["/dashboard", "/employees", "/students"];

  if (!pagesWithNav.includes(pathname)) return null; // ✅ Hide on other pages

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div>
        <Link href="/dashboard" className={`mr-4 ${pathname === "/dashboard" ? "font-bold" : ""}`}>Dashboard</Link>
        {/* <Link href="/employees" className={`mr-4 ${pathname === "/employees" ? "font-bold" : ""}`}>Employees</Link> */}
        {/* <Link href="/students" className={`mr-4 ${pathname === "/students" ? "font-bold" : ""}`}>Students</Link> */}
      </div>
      <Link href="/logout" className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">Logout</Link>
    </nav>
  );
}
