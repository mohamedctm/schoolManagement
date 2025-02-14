"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, DoorOpen } from "lucide-react";
import Image from "next/image";
import Heading from "@/components/Heading";

export default function WebsiteMenu() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isPageWithMenuNav = (path: string) => {
    return (
      path.startsWith("/home") ||
      path.startsWith("/contact") ||
      path.startsWith("/portal") ||
      path === "/about" ||
      path === "/"
    );
  };

  if (!isPageWithMenuNav(pathname)) return null; // ✅ Hide on other pages

  return (
    <nav className="bg-white text-gray-700 border-b border-gray-300 p-5 flex justify-between items-center">
      {/* Logo + Readers School */}
      <div className="flex items-center gap-4">
        <Image 
          src="/logo-min.png" 
          priority 
          alt="Logo" 
          width={50} 
          height={50} 
          className="w-auto h-auto"
        />
        <Heading>Readers School</Heading>
      </div>

      {/* Desktop Navigation Links (Hidden in Mobile) */}
      <div className="hidden md:flex gap-12 text-lg">
        <Link href="/" className={`hover:text-purple-800 ${pathname === "/" ? "text-purple-800" : "text-gray-500"}`}>
          Home
        </Link>
        <Link href="/about" className={`hover:text-purple-800 ${pathname === "/about" ? "text-purple-800" : "text-gray-500"}`}>
          About Us
        </Link>
        <Link href="/contact" className={`hover:text-purple-800 ${pathname === "/contact" ? "text-purple-800" : "text-gray-500"}`}>
          Contact
        </Link>
        <Link href="/login" className={`hover:text-purple-800 ${pathname === "/login" ? "text-purple-800" : "text-gray-500"}`}>
          Login
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMenuOpen(!menuOpen)} 
        className="md:hidden text-gray-500 z-50"
      >
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Sliding Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden z-40`}
      >
        <div className="p-5 flex justify-between items-center border-b border-gray-300">
          <span className="text-lg font-bold text-purple-800">Menu</span>
          <button onClick={() => setMenuOpen(false)}>
            <X size={28} />
          </button>
        </div>
        <div className="flex flex-col items-start p-5 gap-4">
          <Link href="/" className="text-gray-500 hover:text-purple-800 text-lg" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link href="/about" className="text-gray-500 hover:text-purple-800 text-lg" onClick={() => setMenuOpen(false)}>
            About Us
          </Link>
          <Link href="/contact" className="text-gray-500 hover:text-purple-800 text-lg" onClick={() => setMenuOpen(false)}>
            Contact
          </Link>
          <Link href="/login" className="text-gray-500 hover:text-purple-800 text-lg" onClick={() => setMenuOpen(false)}>
            Login
          </Link>
        </div>
      </div>

      {/* Overlay to close menu when clicking outside */}
      {menuOpen && (
        <div 
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-30" 
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
}
