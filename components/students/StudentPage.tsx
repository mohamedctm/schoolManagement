"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Heading from "@/components/Heading";
import { Student } from "@/types/student";
import {Pagination} from "@/components/paging";

import { ArrowLeft, Plus, Search, Loader2} from "lucide-react";
import Modal from "@/components/Modal";
import AddStudentPage from "@/components/students/AddStudentForm";


export default function StudentPage() {

  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingLink, setLoadingLink] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

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
        console.log("Auth check failed:", error);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("first_name", { ascending: true });

    if (error) {
      console.log("Error fetching students:", error);
    } else {
      setStudents(data);
      setFilteredStudents(data);
    }
    setLoading(false);
  };

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
      supabase.removeChannel(subscription);
    };
  }, []);

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
    setCurrentPage(1);
  };

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const handlePageChange = useCallback(
    (pageNumber: number) => {
      if (pageNumber < 1 || pageNumber > totalPages) return;
      setCurrentPage(pageNumber);
    },
    [totalPages]
  );
  const [modal, setModal] = useState<string | null>(null);

  return (
    <div className="w-full max-w-full mx-auto h-auto overflow-x-hidden">
      {/* Modal for Adding Student */}
      {modal === "category" && (
        <Modal isOpen onClose={() => setModal(null)}>
          <AddStudentPage />
        </Modal>
      )}
  
      {/* Back to Dashboard */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => {
            setLoadingLink("/dashboard");
            router.push("/dashboard");
          }}
          disabled={loadingLink !== null}
          className={`flex items-center text-gray-500 px-3 py-2 rounded hover:bg-red-300 hover:text-red-900 transition ${
            loadingLink === "/dashboard" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/dashboard" ? <Loader2 className="animate-spin" size={20} /> : <ArrowLeft size={20} />}
          &nbsp;Dashboard
        </button>
      </div>
  
      {/* Page Heading & Add Student */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-800">Students</h1>
  
        <button
          onClick={() => setModal("category")}
          disabled={loadingLink !== null}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 max-w-[200px] rounded-lg hover:bg-blue-700 transition"
        >
          {loadingLink === "/students/add" ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
          Add Student
        </button>
      </div>
  
      {/* Search Input */}
      <div className="flex items-center gap-2 bg-white border border-gray-300 w-full sm:w-auto rounded-lg px-3 py-2 my-3">
        <Search size={20} className="text-gray-500 max-w-[400px]" />
        <input
          type="text"
          placeholder="Search by first or last name..."
          className="w-full outline-none text-sm"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
  
      {/* Pagination (Top) */}
      {totalPages > 1 && (
        <div className="flex justify-center my-4">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
  
      {/* Student List Section */}
      <div className="bg-white shadow-md rounded-lg p-4 py-6 flex flex-col gap-3 overflow-y-auto max-h-[60vh]">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : currentStudents.length === 0 ? (
          <p className="text-center text-gray-500">No students found.</p>
        ) : (
          currentStudents.map((student) => (
            <div
              key={student.id}
              className="border border-gray-300 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="text-base font-medium">
                  {student.first_name} {student.last_name}
                </h2>
              </div>
  
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/students/assign/${student.id}`)}
                  className="flex items-center justify-center gap-2 bg-blue-200 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-600 hover:text-blue-200 transition"
                >
                  Assign
                </button>
  
                <button
                  onClick={() => router.push(`/students/edit/${student.id}`)}
                  className="flex items-center justify-center gap-2 bg-green-200 text-green-700 px-3 py-2 rounded-lg hover:bg-green-700 hover:text-green-200 transition"
                >
                  Manage
                </button>
              </div>
            </div>
          ))
        )}
      </div>
  
      {/* Pagination (Bottom) */}
      {totalPages > 1 && (
        <div className="flex justify-center my-4">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
  
}

