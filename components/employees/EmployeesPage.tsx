"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Employee } from "@/types/employee";
import Heading from "@/components/Heading";
import {Pagination} from "@/components/paging";
import { ArrowLeft, Plus, Search, Loader2,Settings } from "lucide-react";
import AddEmployeeForm from "@/components/employees/AddEmployeeForm";
import Modal from "@/components/Modal";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingLink, setLoadingLink] = useState<string | null>(null); // Track clicked link
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 10;
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
          fetchEmployees();
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

  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.log("Error fetching employees:", error);
    } else {
      setEmployees(data);
      setFilteredEmployees(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    const subscription = supabase
      .channel("employees")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "employees" },
        () => {
          if (isMounted) fetchEmployees();
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
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(
        (employee) =>
          employee.name.toLowerCase().includes(query.toLowerCase()) ||
          employee.last_name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
    setCurrentPage(1);
  };

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

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
      {/* Modal for Adding Employee */}
      {modal === "category" && (
        <Modal isOpen onClose={() => setModal(null)}>
          <AddEmployeeForm />
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
          className={`flex items-center text-gray-500 px-3 py-2 rounded hover:bg-red-300 hover:text-red-900 ${
            loadingLink === "/dashboard" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/dashboard" ? <Loader2 className="animate-spin" size={20} /> : <ArrowLeft size={20} />}
          &nbsp;Dashboard
        </button>
      </div>
  
      {/* Page Heading */}
        <Heading>Employees</Heading>
  
      {/* Search & Add Employee Section */}
      <div className="flex flex-col sm:flex-row sm:items-left sm:justify-left gap-3">
        {/* Search Box */}
        <div className="flex w-auto items-center gap-2 bg-white border border-gray-300  sm:w-auto rounded-lg px-3 py-2">
          <Search size={20} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or last name..."
            className="w-full outline-none text-sm"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
  
        {/* Add Employee Button */}
        <button
          onClick={() => setModal("category")}
          disabled={loadingLink !== null}
          className="flex items-center max-w-[200px] gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {loadingLink === "/employees/add" ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
          Add Employee
        </button>
      </div>
  
      {/* Pagination (Top) */}
      {totalPages > 1 && (
        <div className="flex justify-center my-4">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
  
      {/* Employee List Section */}
      <div className="bg-white shadow-md rounded-lg p-4 py-6 flex flex-col gap-3 overflow-y-auto min-h-[60vh]">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : currentEmployees.length === 0 ? (
          <p className="text-center text-gray-500">No employees found.</p>
        ) : (
          currentEmployees.map((employee) => (
            <div
              key={employee.id}
              className="max-w-[900px] border-b border-b-gray-300 p-4 rounded-lg flex flex-row flex-wrap sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex flex-row flex-wrap sm:flex-row sm:items-center gap-3">
              {/* <p className="text-gray-600 min-w-[160px] text-sm sm:text-base">&#40; {employee.position} &#41;</p> */}
              <h2 className="order-2 text-base font-medium">
                  {employee.name} {employee.last_name}
                </h2>
              </div>
  
              {/* Manage Button */}
              <div className="order-1 relative group w-[90px]">
              <button
                onClick={() => {
                  setLoadingLink(`/employees/edit/${employee.id}`);
                  router.push(`/employees/edit/${employee.id}`);
                }}
                disabled={loadingLink !== null}
                className={`flex items-center justify-center gap-2 bg-blue-200 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-600 hover:text-blue-200 transition ${
                  loadingLink === `/employees/edit/${employee.id}` ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loadingLink === `/employees/edit/${employee.id}` ? <Loader2 className="animate-spin" size={20} /> : <Settings size={20} />}
              </button>
              <span className="absolute left-1/2 bottom-full mb-2 w-max -translate-x-1/2 bg-yellow-400 text-orange-900 text-s rounded-lg px-3 p-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
    manage
  </span>
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

