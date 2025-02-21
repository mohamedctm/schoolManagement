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

    <div className="p-6 max-w-4xl mx-auto">
      {modal === "category" && <Modal isOpen onClose={() => setModal(null)}><AddStudentPage  /></Modal>}

      <div className="flex justify-between items-center mb-4">
      
        <button
          onClick={() => router.push("/dashboard")}
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
        <Heading>Students</Heading>
        <button
          // onClick={() => router.push("/students/add")}
          onClick={() => setModal("category")}
          className="flex items-center gap-2 bg-white text-gray-600 hover:bg-blue-200 hover:text-blue-900 px-4 py-2 rounded"
        >
          <Plus size={20} />
          Add Student
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 w-[90%]">
          <Search size={20} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by student first name or last name..."
            className="w-full outline-none"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}  
      </div>


      <div className="bg-white shadow rounded-lg p-4 py-8 flex-grow overflow-auto flex flex-col gap-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : currentStudents.length === 0 ? (
          <p className="text-center text-gray-500">No students found.</p>
        ) : (
          currentStudents.map((student) => (
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
                  onClick={() => router.push(`/students/assign/${student.id}`)}
                  className="flex items-center justify-center gap-2 bg-blue-200 text-blue-900 px-3 py-1 rounded hover:bg-blue-700 hover:text-white"
                >
                  Assign
                </button>
                <button
                  onClick={() => router.push(`/students/edit/${student.id}`)}
                  className="flex items-center justify-center gap-2 bg-green-200 text-green-900 px-3 py-1 rounded hover:bg-green-700 hover:text-white"
                >
                  Manage
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
      <p className="py-12">&nbsp;</p>

    </div>

  );
}

