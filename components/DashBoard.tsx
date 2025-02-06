'use client';
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, GraduationCap } from "lucide-react";

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
    return   <div className="text-4xl font-bold bg-gradient-to-r from-fuchsia-700 to-yellow-500 bg-clip-text text-transparent mb-6">
Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold"></h1>
      <nav className="mt-6 flex gap-4">
        <Link href="/employees" className="flex items-center gap-2 p-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition">
          <Users size={24} />
          <span>Manage Employees</span>
        </Link>
        <Link href="/students" className="flex items-center gap-2 p-4 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition">
          <GraduationCap size={24} />
          <span>Manage Students</span>
        </Link>
      </nav>
    </div>
  );
}