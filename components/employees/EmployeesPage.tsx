"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Employee } from "@/types/employee";
import Heading from "@/components/Heading";
import { Plus, Search } from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]); // State for filtered employees
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch("/api/auth", { credentials: "include" });
      if (!response.ok) {
        router.push("/login");
        return;
      }
      fetchEmployees();
    };
    checkAuth();
  }, [router]);

  // ✅ Fetch Employees Initially
  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("employees").select("*");
    if (!error && data) {
      setEmployees(data);
      setFilteredEmployees(data); // Initialize filtered employees with all employees
    }
    setLoading(false);
  };

  // ✅ Real-Time Sync: Listen for Insert, Update, Delete Changes
  useEffect(() => {
    const subscription = supabase
      .channel("employees")
      .on("postgres_changes", { event: "*", schema: "public", table: "employees" }, () => {
        fetchEmployees(); // Re-fetch employees when DB updates
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
      setFilteredEmployees(employees); // Reset to all employees if search query is empty
    } else {
      const filtered = employees.filter(
        (employee) =>
          employee.name.toLowerCase().includes(query.toLowerCase()) ||
          employee.last_name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredEmployees(filtered); // Update filtered employees
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      await supabase.from("salary").delete().eq("id", id);
      await supabase.from("employee_info").delete().eq("id", id);
      await supabase.from("employees").delete().eq("id", id);
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto h-screen">
      <div className="flex justify-between items-center mb-4">
        <Heading>Employees</Heading>
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
        <Link
          href="/employees/add"
          className="flex items-center gap-2 bg-white text-gray-600 hover:bg-green-600 hover:text-white px-4 py-2 rounded"
        >
          <Plus size={20} />
          Add Employee
        </Link>
      </div>
      <div className="bg-white shadow rounded-lg p-4 h-[80vh] overflow-auto flex flex-col gap-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : filteredEmployees.length === 0 ? (
          <p className="text-center text-gray-500">No employees found.</p>
        ) : (
          filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="border border-gray-300 p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <h2 className="text-lg font-semibold">
                  {employee.name} {employee.last_name}
                </h2>
                <p className="text-gray-600">&#40; {employee.position} &#41;</p>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button
                  onClick={() => handleDeleteEmployee(employee.id)}
                  className="bg-orange-700 text-white px-3 py-1 rounded hover:bg-red-500"
                >
                  Delete
                </button>
                <Link
                  href={`/employees/edit/${employee.id}`}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-400"
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