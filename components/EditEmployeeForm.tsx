"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Employee, Salary, EmployeeInfo } from "@/types/employee";
import Heading from "@/components/Heading";

interface EditEmployeeFormProps {
  id: string; // id is passed as a string
}

export default function EditEmployeeForm({ id }: EditEmployeeFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  
  const [salary, setSalary] = useState<Salary>({
    id: 0, // Ensures id is always present
    salary: 0
  });
  const [employee, setEmployee] = useState<Employee>({
    id: 0, // Ensures id is always present
    name: "",
    email: "",
    position: "",
    username: "",
    password: "",
    last_name: "",
  });

  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo>({
    id: 0, // Ensures id is always present
    address: "",
    phone_number: ""
  });

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const employeeId = Number(id);
        // Fetch employee data
        const { data: empData, error: empError } = await supabase
        .from("employees")
        .select("*")
        .eq("id", employeeId)
        .single();

        if (empError) throw empError;
        setEmployee(empData);
        // Fetch salary data
        const { data: salData, error: salError } = await supabase
          .from("salary")
          .select("*")
          .eq("id", employeeId)
          .single();

        if (salError) throw salError;
        setSalary(salData);

        // Fetch employee info data
        const { data: empInfoData, error: empInfoError } = await supabase
          .from("employee_info")
          .select("*")
          .eq("id", employeeId)
          .single();

        if (empInfoError) throw empInfoError;
        setEmployeeInfo(empInfoData);

         

      } catch (error) {
        console.error("Error fetching employee data:", error);
        setMessage("Failed to fetch employee info data.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [id]);

  const handleUpdate = async () => {
    if (!employee || !salary || !employeeInfo) return;

    try {
      // Update employee data
      const { error: empError } = await supabase
        .from("employees")
        .update({
          name: employee.name,
          email: employee.email,
          position: employee.position,
          username: employee.username,
          last_name: employee.last_name,
        })
        .eq("id", id);

      if (empError) throw empError;

      // Update salary data
      const { error: salError } = await supabase
        .from("salary")
        .update({
          salary: salary.salary,
        })
        .eq("id", id);

      if (salError) throw salError;

      // Update employee info data
      const { error: empInfoError } = await supabase
        .from("employee_info")
        .update({
          address: employeeInfo.address,
          phone_number: employeeInfo.phone_number,
        })
        .eq("id", id);

      if (empInfoError) throw empInfoError;

      setMessage("Employee details updated successfully!");
    } catch (error) {
      console.error("Error updating employee data:", error);
      setMessage("Failed to update employee details.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto h-screen">
      <div className="flex justify-between items-center mb-4">
        <Heading>Edit Employee</Heading>
        <Link href="/employees" className="bg-white text-black px-4 py-2 rounded hover:bg-red-600 hover:text-white">
          Back to Employees
        </Link>
      </div>
      {message && <p className="text-green-600 font-semibold mb-4">{message}</p>}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Employee Information</h2>
          <input
            type="text"
            placeholder="First name"
            className="w-full p-2 border border-gray-300 rounded mb-2"
            value={employee?.name || ""}
            onChange={(e) => setEmployee({ ...employee, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Last name"
            className="w-full p-2 border border-gray-300 rounded mb-2"
            value={employee?.last_name || ""}
            onChange={(e) => setEmployee({ ...employee, last_name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded mb-2"
            value={employee?.email || ""}
            onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Position"
            className="w-full p-2 border border-gray-300 rounded mb-2"
            value={employee?.position || ""}
            onChange={(e) => setEmployee({ ...employee, position: e.target.value })}
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Salary Information</h2>
          <input
            type="number"
            placeholder="Salary"
            className="w-full p-2 border border-gray-300 rounded mb-2"
            value={salary?.salary || ""}
            onChange={(e) => setSalary({ ...salary, salary: Number(e.target.value) })}
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Additional Information</h2>
          <input
            type="text"
            placeholder="Address"
            className="w-full p-2 border border-gray-300 rounded mb-2"
            value={employeeInfo?.address || ""}
            onChange={(e) => setEmployeeInfo({ ...employeeInfo, address: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone Number"
            className="w-full p-2 border border-gray-300 rounded mb-2"
            value={employeeInfo?.phone_number || ""}
            onChange={(e) => setEmployeeInfo({ ...employeeInfo, phone_number: e.target.value })}
          />
        </div>
        <button
          onClick={handleUpdate}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Update Employee
        </button>
      </div>
    </div>
  );
}