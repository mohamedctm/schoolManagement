"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Student } from "@/types/student";
import Heading from "@/components/Heading";
import { ArrowLeft, Plus, Search } from "lucide-react";

export default function StudentPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/auth", { credentials: "include" });
        if (!response.ok) {
          router.push("/login");
          return;
        }
        fetchEmployees();
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    })();
  }, [router]);

  // ✅ Fetch Employees Initially
  const fetchEmployees = async () => {
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
    const subscription = supabase
      .channel("students")
      .on("postgres_changes", { event: "*", schema: "public", table: "students" }, () => {
        fetchEmployees();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
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

  return (
    <div className="p-6 max-w-4xl mx-auto h-screen">
      <div className="flex justify-between items-center mb-4">
        <Link href="/dashboard" className="bg-white flex items-center text-gray-500 px-4 py-2 rounded hover:bg-red-300 hover:text-red-900">
          <ArrowLeft size={20} />Dashboard
        </Link>
      </div>
      <div className="flex justify-between items-center mb-4">
        <Heading>Students</Heading>
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
        <Link
          href="/students/add"
          className="flex items-center gap-2 bg-white text-gray-600 hover:bg-blue-200 hover:text-blue-900 px-4 py-2 rounded"
        >
          <Plus size={20} />
          Add Student
        </Link>
      </div>
      <div id="students" className="bg-white shadow rounded-lg p-4 py-8 lex-grow (flex-1) overflow-auto flex flex-col gap-4">
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
                {/* <p className="text-gray-600">&#40; {student.gender ?? "N/A"} &#41;</p> */}
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <Link
                  href={`/students/edit/${student.id}`}
                  className="bg-green-200 text-green-800 px-3 py-1 rounded hover:bg-green-700 hover:text-white"
                >
                  Manage
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
