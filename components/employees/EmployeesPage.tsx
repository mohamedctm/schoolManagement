"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Employee } from "@/types/employee";
import { ArrowLeft, Plus, Search, Loader2 } from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
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
          fetchEmployees();
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

  // ✅ Fetch Employees Initially with Cleanup
  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("employees").select("*");

    if (error) {
      console.error("Error fetching employees:", error);
    } else {
      setEmployees(data);
      setFilteredEmployees(data);
    }
    setLoading(false);
  };

  // ✅ Real-Time Sync: Listen for Insert, Update, Delete Changes
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
      supabase.removeChannel(subscription); // ✅ Cleanup on unmount
    };
  }, []);

  // ✅ Handle Search Input Change
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
  };

  // ✅ Handle Navigation with Loading State
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
        <h1 className="text-xl font-semibold">Employees</h1>
      </div>
      <div className="flex justify-between items-center mb-4">
        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 w-1/2">
          <Search size={20} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or last name..."
            className="w-full outline-none"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Add Employee Button */}
        <button
          onClick={() => handleNavigation("/employees/add")}
          disabled={loadingLink !== null}
          className={`flex items-center gap-2 bg-white text-gray-600 hover:bg-blue-200 hover:text-blue-900 px-4 py-2 rounded ${
            loadingLink === "/employees/add" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/employees/add" ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
          Add Employee
        </button>
      </div>
      <div id="employees" className="bg-white shadow rounded-lg p-4 py-8 flex-grow overflow-auto flex flex-col gap-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : filteredEmployees.length === 0 ? (
          <p className="text-center text-gray-500">No employees found.</p>
        ) : (
          filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="border border-gray-300 p-4 py-6 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <h2 className="text-lg font-normal">
                  {employee.name} {employee.last_name}
                </h2>
                <p className="text-gray-600">&#40; {employee.position} &#41;</p>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button
                  onClick={() => handleNavigation(`/employees/edit/${employee.id}`)}
                  disabled={loadingLink !== null} // ✅ Prevent multiple clicks
                  className={`flex items-center justify-center gap-2 bg-green-200 text-green-800 px-3 py-1 rounded hover:bg-green-700 hover:text-white ${
                    loadingLink === `/employees/edit/${employee.id}` ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loadingLink === `/employees/edit/${employee.id}` ? (
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
