'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch('/api/auth', { credentials: 'include' });
      if (!response.ok) {
        router.push('/login'); // ✅ Redirect if not authenticated
        return;
      }

      const data = await response.json();
      setUser({ username: data.username });
    };

    checkAuth();
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {user.username}!</h1>
      <nav className="mt-4">
        <a href="/employees" className="block text-blue-500">Manage Employees</a>
        <a href="/students" className="block text-blue-500 mt-2">Manage Students</a>
      </nav>
    </div>
  );
}
