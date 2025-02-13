"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Heading from "@/components/Heading";
import { ArrowLeft } from "lucide-react";

// import bcrypt from "bcryptjs";

export default function AddStudentPage() {
  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    birth_date:""
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
    const { data, error } = await supabase.from("students").insert([
      { ...form }
    ]).select("id").single();
    
    if (error || !data) {
      setMessage("Error adding student. Please try again.");
    } else {
      const studentId = data.id;
      
      await supabase.from("parents").insert([{ id: studentId}]);      
      setMessage(`Student ${form.first_name} has been created successfully!`);
      setForm({ first_name: "", middle_name: "", last_name: "", gender: "",birth_date:"" });
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto h-screen">
      <div className="flex justify-between items-center mb-4">
      <Link href="/students" className="bg-white flex items-center text-gray-500 px-4 py-2 rounded hover:bg-red-300 hover:text-red-900">
      <ArrowLeft size={20} /> &nbsp; back to Student
        </Link>
      </div>
      <div className="flex justify-between items-center mb-4">
        <Heading> Add Student</Heading>
      </div>
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <input type="text" placeholder=" first name" className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
        <input type="text" placeholder=" middile name" className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.middle_name} onChange={(e) => setForm({ ...form, middle_name: e.target.value })} required />
        <input type="text" placeholder=" last name" className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
        <input type="date" placeholder="birth date" className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} required />
        <select className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} required>
          <option value="" disabled>Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        {/* <input type="text" placeholder="Username" autoComplete="create a user name" className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <input type="password" placeholder="Password" autoComplete="new-password" className="w-full p-2 border border-gray-300 rounded mb-4" 
          value={form.password}
           onChange={(e) => setForm({ ...form, password: e.target.value })} required /> */}
        <button type="submit" className="w-full bg-green-200 text-lg text-green-800 px-4 py-2 rounded hover:bg-green-600 hover:text-green-100">
          Add Student
        </button>
      </form>
      {message && <p className="mt-6 text-green-500 text-xl font-mono">{message}</p>}
    </div>
  );
}
