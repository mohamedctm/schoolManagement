"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Employee } from "@/types/employee";
import Heading from "@/components/Heading";
import { ArrowLeft } from "lucide-react";
import bcrypt from "bcryptjs";

interface EditEmployeeFormProps {
  id: string;
}

export default function EditEmployeeForm({ id }: EditEmployeeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  
  const [employee, setEmployee] = useState<Employee>({
    id: 0,
    name: "",
    last_name: "",
    email:"",
    username: "",
    password: "",
    position: ""
  });

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const employeeId = Number(id);
        const { data: empData, error: empError } = await supabase.from("employees").select("*").eq("id", employeeId).single();
        if (empError) throw empError;
        setEmployee(empData);
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
    if (!employee.username || !employee.password) return;
    try {
      const hashedPassword = await bcrypt.hash(employee.password, 10);
      await supabase.from("employees").update({
        username: employee.username,
        password: hashedPassword,
      }).eq("id", id);
      setMessage("Username and password updated successfully!");
    } catch (error) {
      console.error("Error updating username and password:", error);
      setMessage("Failed to update username and password.");
    }
  };

  if (loading) return <p>wait...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto h-screen">
      <div className="flex justify-between items-center mb-4">
      <Link href="/employees" className="bg-white flex items-center text-gray-500 px-4 py-2 rounded hover:bg-red-600 hover:text-white">
      <ArrowLeft size={20} />
       &nbsp; back to Employees
        </Link>
      </div>
      <div className="flex justify-between items-center mb-4">
        <Heading> Create username</Heading>
      </div>
      {message && <p className="text-green-600 font-semibold mb-4">{message}</p>}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Employee Information</h2>
          <p className="text-gray-700">{employee.name} {employee.last_name}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Set Username & Password</h2>
          <input type="text" placeholder="New Username" autoComplete="current username" className="w-full p-2 border border-gray-300 rounded mb-2" value="" onChange={(e) => setEmployee({ ...employee, username: e.target.value })} required />
          <input type="password" placeholder="New Password" autoComplete="current password" className="w-full p-2 border border-gray-300 rounded mb-2" value="" onChange={(e) => setEmployee({ ...employee, password: e.target.value })} required />
        </div>
        <button onClick={handleUpdate}
          className="w-full bg-yellow-400 text-white px-4 py-2 rounded hover:bg-pink-600">
            Update Credentials</button>
      </div>
    </div>
  );
}
