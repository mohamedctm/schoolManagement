"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
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
    <>
      {/* Navbar Container */}
      <nav className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-md
      p-5 flex justify-between items-center ">
        {/* Logo + School Name */}
        <div className="flex items-center gap-4">
          <Image 
            src="/logo-min.png" 
            priority 
            alt="Logo" 
            width={50} 
            height={50} 
            className="w-auto h-auto"
          />
          <h1 className="text-2xl font-bold text-yellow-200 ">Readers School</h1>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex gap-8 text-lg">
          {[
            { name: "Home", path: "/" },
            { name: "About Us", path: "/about" },
            { name: "Contact", path: "/contact" },
            { name: "Login", path: "/login" },
          ].map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`relative px-4 py-2 rounded-lg transition-all duration-300 ${
                pathname === link.path
                  ? "bg-white text-purple-700 shadow-lg"
                  : "hover:bg-white hover:text-purple-700 hover:shadow-md"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className="md:hidden text-white z-50"
        >
          {menuOpen ? <X size={42} /> : <Menu size={42} />}
        </button>

        {/* SVG Curved Bottom */}
        {/* <div className="absolute bottom-[30px] left-0 w-full">
          <svg
            viewBox="0 0 1440 320"
            className="w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="white"
              fillOpacity="1"
              d="M0,256L80,245.3C160,235,320,213,480,192C640,171,800,149,960,165.3C1120,181,1280,235,1360,261.3L1440,288L1440,320L0,320Z"
            ></path>
          </svg>
        </div> */}
      </nav>

      {/* Mobile Sliding Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white text-purple-700 shadow-xl transform transition-transform ${
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
          {[
            { name: "Home", path: "/" },
            { name: "About Us", path: "/about" },
            { name: "Contact", path: "/contact" },
            { name: "Login", path: "/login" },
          ].map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className="w-full py-3 px-4 rounded-lg text-lg text-gray-700 hover:bg-purple-200 hover:text-purple-900 transition-all duration-300"
              onClick={() => setMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Overlay to close menu when clicking outside */}
      {menuOpen && (
        <div 
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-30" 
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </>
  );
}
