"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Heading from "@/components/Heading";
import { ArrowLeft } from "lucide-react";

export default function AddStudentPage() {
  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    birth_date: ""
  });
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages

    try {
      // Insert student data
      const { data, error } = await supabase
        .from("students")
        .insert([{ ...form }])
        .select("id")
        .single();

      if (error || !data) {
        console.error("Error adding student:", error);
        setMessage("Error adding student. Please try again.");
        return;
      }

      const studentId = data?.id;
      if (!studentId) return; // Ensure student ID exists before proceeding

      // Insert parent record linked to student ID
      const { error: parentError } = await supabase
        .from("parents")
        .insert([{ id: studentId }]);

      if (parentError) {
        console.error("Error adding parent record:", parentError);
        setMessage("Student added, but parent record failed.");
        return;
      }

      // Success Message
      setMessage(`Student ${form.first_name} has been created successfully!`);
      setForm({ first_name: "", middle_name: "", last_name: "", gender: "", birth_date: "" });

    } catch (error) {
      console.error("Unexpected error:", error);
      setMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto h-screen">
      <div className="flex justify-between items-center mb-4">
        <Link href="/students" className="bg-white flex items-center text-gray-500 px-4 py-2 rounded hover:bg-red-300 hover:text-red-900">
          <ArrowLeft size={20} /> &nbsp; Back to Students
        </Link>
      </div>

      <div className="flex justify-between items-center mb-4">
        <Heading>Add Student</Heading>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <input 
          type="text" placeholder="First Name" 
          className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.first_name} 
          onChange={(e) => setForm({ ...form, first_name: e.target.value })} required 
        />
        <input 
          type="text" placeholder="Middle Name" 
          className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.middle_name} 
          onChange={(e) => setForm({ ...form, middle_name: e.target.value })} required 
        />
        <input 
          type="text" placeholder="Last Name" 
          className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.last_name} 
          onChange={(e) => setForm({ ...form, last_name: e.target.value })} required 
        />
        <input 
          type="date" placeholder="Birth Date" 
          className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.birth_date} 
          onChange={(e) => setForm({ ...form, birth_date: e.target.value })} required 
        />
        <select 
          className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.gender} 
          onChange={(e) => setForm({ ...form, gender: e.target.value })} required
        >
          <option value="" disabled>Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        
        <button type="submit" className="w-full bg-green-200 text-lg text-green-800 px-4 py-2 rounded hover:bg-green-600 hover:text-green-100">
          Add Student
        </button>
      </form>

      {message && <p className="mt-6 text-green-500 text-xl font-mono">{message}</p>}
    </div>
  );
}
