"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export default function WebsiteMenu() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isPageWithMenuNav = (path:string) =>
    path.startsWith("/home") ||
    path.startsWith("/contact") ||
    path.startsWith("/portal") ||
    path === "/about" ||
    path === "/";

  if (!isPageWithMenuNav(pathname)) return null;

  return (
    <>
      {/* Navbar */}
      <nav className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
        <div className="relative max-w-6xl text-white shadow-md p-4 flex justify-between items-center">
          {/* Logo + School Name */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo-min.png"
              priority
              alt="Logo"
              width={50}
              height={50}
              className="w-auto h-auto"
            />
            <h1 className="text-xl font-bold text-yellow-200">Readers School</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6 text-lg">
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
            className="md:hidden text-white"
            aria-label="Open Menu"
          >
            {menuOpen ? <X size={40} /> : <Menu size={40} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white text-purple-700 shadow-xl transition-all duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
        style={{
          position: "absolute",
          transition: "transform 0.3s ease-in-out",
          transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
        }}
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

      {/* Overlay for Closing Menu */}
      {menuOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-gray-700"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </>
  );
}
