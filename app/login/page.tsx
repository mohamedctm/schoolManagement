"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
        return;
      }

      router.push("/dashboard");
    } catch (_err) {
      setError("Network error, please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-lg-screen p-4">
      <Image src="/logo-min.png" priority alt="Logo" width={110} height={116} style={{ width: "auto", height: "auto" }} className="mb-5" />
      <h1 className="text-4xl font-bold bg-gradient-to-r from-fuchsia-700 to-yellow-500 bg-clip-text text-transparent mb-6">
        Login
      </h1>
      <form onSubmit={handleLogin} className="w-full max-w-md bg-white border-l border-t border-r border-gray-300 p-8 rounded-4xl shadow-2xl">
        <input
          type="text"
          placeholder="Username"
          name="username"
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-300"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required autoComplete="current username"
        />
        <div className="relative mt-4">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required autoComplete="current password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-yellow-400 pointer text-white py-3 mt-6 rounded hover:bg-pink-400 transition duration-300 ease-in-out"
        >
          Login
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
      <br/>
      <Link href="/" className="bg-white flex items-center text-gray-500 px-4 py-2 rounded hover:bg-red-300 hover:text-red-900">
      <ArrowLeft size={20} /> &nbsp; back to website
        </Link>
    </div>
    
  );
}
