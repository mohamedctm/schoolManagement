"use client";

// import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, GraduationCap, Package, Loader2, BookOpen} from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loadingLink, setLoadingLink] = useState<string | null>(null); // ✅ Track clicked link
  const router = useRouter();

  useEffect(() => {
    let isMounted = true; // ✅ Track component mount status

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth', { credentials: 'include' });

        if (!response.ok) {
          if (isMounted) {
            router.push('/login'); // ✅ Redirect only if mounted
          }
          return;
        }

        const data = await response.json();
        if (isMounted) {
          setUser({ username: data.username }); // ✅ Set state only if mounted
        }
      } catch (error) {
        console.log("Authentication error:", error);
      }
    };

    checkAuth();

    return () => {
      isMounted = false; // ✅ Cleanup effect on unmount
    };
  }, [router]);

  const handleNavigation = (path: string) => {
    setLoadingLink(path); // ✅ Set loading state for clicked link
    router.push(path);
  };

  if (!user) {
    return (
      <div className="text-xl font-bold bg-gradient-to-r from-fuchsia-700 to-yellow-500 bg-clip-text text-transparent mb-6">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <nav className="mt-6 flex flex-wrap gap-6 justify-center md:justify-start">
        <button
          onClick={() => handleNavigation("/employees")}
          disabled={loadingLink !== null} // ✅ Disable all buttons when one is clicked
          className={`flex w-60 items-center gap-2 p-4 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-600 transition ${
            loadingLink === "/employees" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/employees" ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <Users size={24} />
          )}
          <span>Manage Employees</span>
        </button>

        <button
          onClick={() => handleNavigation("/students")}
          disabled={loadingLink !== null}
          className={`flex w-60 items-center gap-2 p-4 bg-green-700 text-white rounded-lg shadow-md hover:bg-green-600 transition ${
            loadingLink === "/students" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/students" ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <GraduationCap size={24} />
          )}
          <span>Manage Students</span>
        </button>

        <button
          onClick={() => handleNavigation("/class")}
          disabled={loadingLink !== null}
          className={`flex w-60 items-center gap-2 p-4 bg-fuchsia-700 text-white rounded-lg shadow-md hover:bg-fuchsia-600 transition ${
            loadingLink === "/class" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/class" ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <BookOpen size={24} />
          )}
          <span>Class Room</span>
        </button>

        <button
          onClick={() => handleNavigation("/orders")}
          disabled={loadingLink !== null}
          className={`flex w-60 items-center gap-2 p-4 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-400 transition ${
            loadingLink === "/orders" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/orders" ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <Package size={24} />
          )}
          <span>Orders</span>
        </button>
      </nav>
    </div>
  );
}
