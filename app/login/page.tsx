"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Loading state
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true); // ✅ Start loading

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
      } else {
        router.push("/dashboard");
      }
    } catch (_err) {
      setError("Network error, please try again.");
    } finally {
      setLoading(false); // ✅ Stop loading
    }
  };

  return (
  <div className="flex flex-col items-center justify-center min-h-screen px-4">
    
    {/* Logo */}
    <Image
      src="/logo-min.png"
      priority
      alt="Logo"
      width={90}
      height={100}
      className="mb-6 w-auto h-auto"
    />

    {/* Title */}
    <h1 className="text-3xl font-semibold text-gray-800 mb-6">
      Welcome Back 👋
    </h1>

    {/* Login Form */}
    <form
      onSubmit={handleLogin}
      className="w-full max-w-sm bg-white shadow-lg rounded-2xl p-6"
    >
      {/* Username Field */}
      <div className="mb-4">
        <label className="text-gray-600 text-sm">Username</label>
        <input
          type="text"
          placeholder="Enter your username"
          name="username"
          className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          disabled={loading}
        />
      </div>

      {/* Password Field */}
      <div className="mb-4 relative">
        <label className="text-gray-600 text-sm">Password</label>
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Enter your password"
          className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none pr-12"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          disabled={loading}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-4 flex items-center text-gray-500"
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={loading}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* Login Button */}
      <button
        type="submit"
        className={`w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : "Login"}
      </button>

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
    </form>

    {/* Back Button */}
    <Link
      href="/"
      className="mt-4 text-blue-700 hover:text-blue-900 flex items-center gap-2 text-sm"
    >
      <ArrowLeft size={18} /> Back to website
    </Link>
  </div>
);

}
