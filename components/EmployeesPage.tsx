"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Employee } from "@/types/employee";
import Heading from "@/components/Heading";


export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
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

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from("employees").select("*");
    if (!error && data) setEmployees(data);
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      // Delete salary record
      await supabase.from("salary").delete().eq("id", id);
      
      // Delete employee_info record
      await supabase.from("employee_info").delete().eq("id", id);

      // Delete employee record
      await supabase.from("employees").delete().eq("id", id);

      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto h-screen">
      <div className="flex justify-between items-center mb-4">
        <Heading>Employees</Heading>
        <Link href="/addEmployee" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Add Employee
        </Link>
      </div>
      <div className="bg-white shadow rounded-lg p-4 h-[80vh] overflow-auto flex flex-col gap-4">
        {employees.map((employee) => (
          <div key={employee.id} className="border border-gray-300 p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h2 className="text-lg font-semibold">{employee.name} {employee.last_name}</h2>
              <p className="text-gray-600">Email: {employee.email}</p>
              <p className="text-gray-600">Position: {employee.position}</p>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button onClick={() => handleDeleteEmployee(employee.id)} className="bg-orange-700 text-white px-3 py-1 rounded hover:bg-red-500">
                Delete
              </button>
              <Link href={`/editEmployee/${employee.id}`} className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-500">
                manage
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
