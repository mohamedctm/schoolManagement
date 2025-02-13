"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Heading from "@/components/Heading";
import { ArrowLeft } from "lucide-react";

// import bcrypt from "bcryptjs";

export default function AddEmployeePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    position: "",
    last_name: "",
  });
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hash the password before inserting
    // const hashedPassword = await bcrypt.hash(form.password, 10);
    
    // const { data, error } = await supabase.from("employees").insert([
    //   { ...form, password: hashedPassword }
    // ]).select("id").single();
    const { data, error } = await supabase.from("employees").insert([
      { ...form }
    ]).select("id").single();
    
    if (error || !data) {
      setMessage("Error adding employee. Please try again.");
    } else {
      const employeeId = data.id;
      
      await supabase.from("salary").insert([{ id: employeeId, salary: 0 }]);
      await supabase.from("employee_info").insert([{ id: employeeId, address: "", phone_number: "" }]);
      
      setMessage(`Employee ${form.name} has been created successfully!`);
      setForm({ name: "", email: "", position: "", last_name: "" });
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto h-screen">
      <div className="flex justify-between items-center mb-4">
      <Link href="/employees" className="bg-white flex items-center text-gray-500 px-4 py-2 rounded hover:bg-red-300 hover:text-red-900">
      <ArrowLeft size={20} /> &nbsp; back to Employees
        </Link>
      </div>
      <div className="flex justify-between items-center mb-4">
        <Heading> Add Employee</Heading>
      </div>
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <input type="text" placeholder="employee first name" className="w-full p-4 border border-gray-300 rounded mb-2" 
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input type="text" placeholder="employee last name" className="w-full p-4 border border-gray-300 rounded mb-2" 
          value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
        <input type="email" placeholder="Email" className="w-full p-4 border border-gray-300 rounded mb-2" 
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <select className="w-full p-4 border border-gray-300 rounded mb-2" 
          value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required>
          <option value="" disabled>Select Position</option>
          <option value="Director General">Director General</option>
          <option value="school Principal">school Principal</option>
          <option value="Director General">Director General</option>
          <option value="School Secretary General">School Secretary General</option>
          <option value="Academic Coordinator">Academic Coordinator</option>
          <option value="Head Teacher">Head Teacher</option>
          <option value="Assistance Head Teacher">Assistance Head Teacher</option>
          <option value="Deputy Head Teacher">Deputy Head Teacher</option>
          <option value="Head Teacher/ Arabic Seciotn">Head Teacher/ Arabic Seciotn</option>
          <option value="Finance & HR">Finance & HR</option>
          <option value="Head/Secondary">Head/Secondary</option>
          <option value="Head/Primary">Head/Primary</option>
          <option value="Head/Kgs">Head/Kgs</option>
          <option value="School Officer">School Officer</option>
          <option value="School Advisor">School Advisor</option>
          <option value="Accountant">Accountant</option>

        </select>
        {/* <input type="text" placeholder="Username" autoComplete="create a user name" className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <input type="password" placeholder="Password" autoComplete="new-password" className="w-full p-2 border border-gray-300 rounded mb-4" 
          value={form.password}
           onChange={(e) => setForm({ ...form, password: e.target.value })} required /> */}
        <button type="submit" className="w-full text-lg bg-green-200 text-green-900 px-4 py-2 rounded hover:bg-green-600 hover:text-white">
          Create Employee
        </button>
      </form>
      {message && <p className="mt-6 text-green-500 text-xl font-mono">{message}</p>}
    </div>
  );
}
