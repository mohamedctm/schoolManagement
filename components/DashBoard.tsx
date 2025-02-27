"use client";

// import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, GraduationCap, Package, Loader2, BookOpen,FileText} from "lucide-react";

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
      <div className=" font-bold bg-gradient-to-r from-fuchsia-700 to-yellow-500 bg-clip-text text-transparent mb-2">
        Loading...
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center  px-4 py-6">
      {/* Page Heading */}
      <h1 className="text-3xl font-bold text-blue-950 mb-6">Dashboard</h1>
  
      {/* Navigation Buttons */}
      <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md md:max-w-2xl">
        {/* Employees */}
        <button
          onClick={() => handleNavigation("/employees")}
          disabled={loadingLink !== null}
          className={`flex items-center justify-center gap-3 p-4 w-full bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ${
            loadingLink === "/employees" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/employees" ? <Loader2 className="animate-spin" size={24} /> : <Users size={24} />}
          <span className="text-lg font-medium">Manage Employees</span>
        </button>
  
        {/* Students */}
        <button
          onClick={() => handleNavigation("/students")}
          disabled={loadingLink !== null}
          className={`flex items-center justify-center gap-3 p-4 w-full bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition duration-300 ${
            loadingLink === "/students" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/students" ? <Loader2 className="animate-spin" size={24} /> : <GraduationCap size={24} />}
          <span className="text-lg font-medium">Manage Students</span>
        </button>
  
        {/* Class Room */}
        <button
          onClick={() => handleNavigation("/class")}
          disabled={loadingLink !== null}
          className={`flex items-center justify-center gap-3 p-4 w-full bg-fuchsia-600 text-white rounded-lg shadow-lg hover:bg-fuchsia-700 transition duration-300 ${
            loadingLink === "/class" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/class" ? <Loader2 className="animate-spin" size={24} /> : <BookOpen size={24} />}
          <span className="text-lg font-medium">Class Room</span>
        </button>
        {/* Exam */}
        <button
          onClick={() => handleNavigation("/exam")}
          disabled={loadingLink !== null}
          className={`flex items-center justify-center gap-3 p-4 w-full bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ${
            loadingLink === "/exam" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/exam" ? <Loader2 className="animate-spin" size={24} /> : <FileText size={24} />}
          <span className="text-lg font-medium">Exams </span>
        </button>
  
        {/* Orders */}
        <button
          onClick={() => handleNavigation("/orders")}
          disabled={loadingLink !== null}
          className={`flex items-center justify-center gap-3 p-4 w-full bg-orange-500 text-white rounded-lg shadow-lg hover:bg-orange-600 transition duration-300 ${
            loadingLink === "/orders" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/orders" ? <Loader2 className="animate-spin" size={24} /> : <Package size={24} />}
          <span className="text-lg font-medium">Orders</span>
        </button>
      </nav>
    </div>
  );
  
  
}
