"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Student } from "@/types/student";
import { ArrowLeft, Plus, Search, Loader2 } from "lucide-react";

export default function StudentPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingLink, setLoadingLink] = useState<string | null>(null); // ✅ Track clicked link
  const router = useRouter();

  useEffect(() => {
    let isMounted = true; // ✅ Prevents setting state on unmount

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth", { credentials: "include" });

        if (!response.ok) {
          if (isMounted) {
            router.push("/login");
          }
          return;
        }

        if (isMounted) {
          fetchStudents();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();

    return () => {
      isMounted = false; // ✅ Cleanup on unmount
    };
  }, [router]);

  // ✅ Fetch Students Initially with Cleanup
  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("students").select("*");

    if (error) {
      console.error("Error fetching students:", error);
    } else {
      setStudents(data);
      setFilteredStudents(data);
    }
    setLoading(false);
  };

  // ✅ Real-Time Sync: Listen for Insert, Update, Delete Changes
  useEffect(() => {
    let isMounted = true;

    const subscription = supabase
      .channel("students")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        () => {
          if (isMounted) fetchStudents();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(subscription); // ✅ Cleanup on unmount
    };
  }, []);

  // ✅ Handle Search Input Change
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        (student) =>
          student.first_name.toLowerCase().includes(query.toLowerCase()) ||
          student.last_name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  };

  // ✅ Handle Link Click with Loading
  const handleNavigation = (path: string) => {
    setLoadingLink(path);
    router.push(path);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto h-screen">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => handleNavigation("/dashboard")}
          disabled={loadingLink !== null}
          className={`flex items-center text-gray-500 px-4 py-2 rounded hover:bg-red-300 hover:text-red-900 ${
            loadingLink === "/dashboard" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/dashboard" ? <Loader2 className="animate-spin" size={20} /> : <ArrowLeft size={20} />}
          &nbsp;Dashboard
        </button>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Students</h1>
      </div>
      <div className="flex justify-between items-center mb-4">
        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 w-1/2">
          <Search size={20} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by student first name or last name..."
            className="w-full outline-none"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Add Student Button */}
        <button
          onClick={() => handleNavigation("/students/add")}
          disabled={loadingLink !== null}
          className={`flex items-center gap-2 bg-white text-gray-600 hover:bg-blue-200 hover:text-blue-900 px-4 py-2 rounded ${
            loadingLink === "/students/add" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/students/add" ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
          Add Student
        </button>
      </div>
      <div id="students" className="bg-white shadow rounded-lg p-4 py-8 flex-grow overflow-auto flex flex-col gap-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : filteredStudents.length === 0 ? (
          <p className="text-center text-gray-500">No students found.</p>
        ) : (
          filteredStudents.map((student) => (
            <div
              key={student.id}
              className="border border-gray-300 p-4 py-6 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2"
            >
              <div className="flex flex-row flex-wrap md:flex-row md:items-center gap-4">
                <h2 className="text-lg font-light">
                  {student.first_name} {student.last_name}
                </h2>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button
                  onClick={() => handleNavigation(`/students/edit/${student.id}`)}
                  disabled={loadingLink !== null} // ✅ Prevent multiple clicks
                  className={`flex items-center justify-center gap-2 bg-green-200 text-green-800 px-3 py-1 rounded hover:bg-green-700 hover:text-white ${
                    loadingLink === `/students/edit/${student.id}` ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loadingLink === `/students/edit/${student.id}` ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Loading...
                    </>
                  ) : (
                    "Manage"
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
