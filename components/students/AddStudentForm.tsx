"use client";

import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
// import Link from "next/link";
import Heading from "@/components/Heading";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function AddStudentPage() {
  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    birth_date: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Track loading state
  // const [loadingLink, setLoadingLink] = useState<string | null>(null); // ✅ Track link clicks
  // const router = useRouter();

  useEffect(() => {
    let isMounted = true; // ✅ Prevent memory leaks

    return () => {
      isMounted = false; // ✅ Cleanup effect on unmount
    };
  }, []);

  // ✅ Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions
    setMessage("");
    setLoading(true);

    try {
      // ✅ Insert student data
      const { data, error } = await supabase
        .from("students")
        .insert([{ ...form }])
        .select("id")
        .single();

      if (error || !data) {
        console.log("Error adding student:", error);
        setMessage("Error adding student. Please try again.");
        setLoading(false);
        return;
      }

      const studentId = data?.id;
      if (!studentId) {
        setLoading(false);
        return;
      } // Ensure student ID exists before proceeding

      // ✅ Insert parent record linked to student ID
      const { error: parentError } = await supabase
        .from("parents")
        .insert([{ id: studentId }]);

      if (parentError) {
        console.log("Error adding parent record:", parentError);
        setMessage("Student added, but parent record failed.");
        setLoading(false);
        return;
      }
      const { error: medicalError } = await supabase
      .from("medical")
      .insert([{ id: studentId }]);

    if (medicalError) {
      console.log("Error adding medical record:", medicalError);
      setMessage("Student added, but medical record failed.");
      setLoading(false);
      return;
    }

      // ✅ Success Message
      setMessage(`Student ${form.first_name} has been created successfully!`);
      setForm({ first_name: "", middle_name: "", last_name: "", gender: "", birth_date: "" });

    } catch (error) {
      console.log("Unexpected error:", error);
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Navigation with Loading State
  // const handleNavigation = (path: string) => {
  //   setLoadingLink(path);
  //   router.push(path);
  // };

  return (
    <div className="p-6 max-w-lg mx-auto h-fit">
      {/* <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => handleNavigation("/students")}
          disabled={loadingLink !== null}
          className={`flex items-center text-gray-500 px-4 py-2 rounded hover:bg-red-300 hover:text-red-900 ${
            loadingLink === "/students" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/students" ? <Loader2 className="animate-spin" size={20} /> : <ArrowLeft size={20} />}
          &nbsp; Back to Students
        </button>
      </div> */}

<div className="text-center w-full mb-4">
<Heading>Add Student</Heading>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <input 
          type="text" placeholder="First Name" 
          className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.first_name} 
          onChange={(e) => setForm({ ...form, first_name: e.target.value })} required 
          disabled={loading}
        />
        <input 
          type="text" placeholder="Middle Name" 
          className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.middle_name} 
          onChange={(e) => setForm({ ...form, middle_name: e.target.value })} required 
          disabled={loading}
        />
        <input 
          type="text" placeholder="Last Name" 
          className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.last_name} 
          onChange={(e) => setForm({ ...form, last_name: e.target.value })} required 
          disabled={loading}
        />
        <input 
          type="date" placeholder="Birth Date" 
          className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.birth_date} 
          onChange={(e) => setForm({ ...form, birth_date: e.target.value })} required 
          disabled={loading}
        />
        <select 
          className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.gender} 
          onChange={(e) => setForm({ ...form, gender: e.target.value })} required
          disabled={loading}
        >
          <option value="" disabled>Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        
        <button 
          type="submit" 
          className={`w-full flex justify-center items-center gap-2 bg-green-700 text-lg text-green-100 px-4 py-2 rounded hover:bg-green-600 hover:text-green-100 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Add Student"}
        </button>
      </form>

      {message && <p className="mt-6 text-green-500 text-xl font-mono">{message}</p>}
    </div>
  );
}
