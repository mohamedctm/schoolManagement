"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
        credentials: "include", // Ensures cookies are sent & received
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Redirect to Dashboard
      router.push("/dashboard");
    } catch (_err) {
      setError("Network error, please try again.");
    }
  };

  return (
<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-200 to-purple-600 p-8">
  <h1 className="text-3xl font-bold text-white mb-8">Login</h1>
  <form onSubmit={handleLogin} className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
    <input
      type="text"
      placeholder="Username"
      name="username"
      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      required
    />
    <input
      type="password"
      name="password"
      placeholder="Password"
      className="w-full p-3 border border-gray-300 rounded mt-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    <button
      type="submit"
      className="w-full bg-purple-700 text-white py-3 mt-6 rounded hover:bg-purple-800 transition duration-300 ease-in-out"
    >
      Login
    </button>
    {error && <p className="text-red-500 mt-4">{error}</p>}
  </form>
</div>

  );
}
