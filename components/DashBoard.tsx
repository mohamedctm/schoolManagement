'use client';
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, GraduationCap, Package } from "lucide-react";

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
    return   <div className="text-xl font-bold bg-gradient-to-r from-fuchsia-700 to-yellow-500 bg-clip-text text-transparent mb-6">
Loading...</div>;
  }

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <nav className="mt-6 flex flex-wrap gap-6 justify-center md:justify-start">
  <Link href="/employees" className="flex w-60 items-center gap-2 p-4 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-600 transition">
    <Users size={24} />
    <span>Manage Employees</span>
  </Link>
  <Link href="/students" className="flex w-60 items-center gap-2 p-4 bg-green-700 text-white rounded-lg shadow-md hover:bg-green-600 transition">
    <GraduationCap size={24} />
    <span>Manage Students</span>
  </Link>
  <Link href="/storage" className="flex w-60 items-center gap-2 p-4 bg-fuchsia-700 text-white rounded-lg shadow-md hover:bg-fuchsia-600 transition">
    <Package size={24} />
    <span>Storage</span>
  </Link>
</nav>
    </div>
  );
}