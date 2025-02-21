"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Heading from "@/components/Heading";
import { Loader2 } from "lucide-react";
interface AddClassPageProps {
  onClassAdded: () => void; // Callback function for updating the main list
}
export default function AddClassPage({ onClassAdded }: AddClassPageProps) {
  const [form, setForm] = useState({
    class_grade: "",
    class_name: "",
    class_size: 0,
    class_description: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Track loading state
  const router = useRouter();

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
      // ✅ Step 1: Check if the class already exists
      const { data: existingClass, error: checkError } = await supabase
        .from("classroom")
        .select("serial")
        .eq("class_grade", form.class_grade)
        .eq("class_name", form.class_name)
        .single();
  
      if (checkError && checkError.code !== "PGRST116") {
        console.log("Error checking existing class:", checkError);
        setMessage("Error checking class existence. Please try again.");
        setLoading(false);
        return;
      }
  
      if (existingClass) {
        setMessage(`Class (${form.class_name}) in ${form.class_grade} already exists!`);
        setLoading(false);
        return;
      }
  
      // ✅ Step 2: Insert class data if not exists
      const { data, error } = await supabase
        .from("classroom")
        .insert([{ ...form }])
        .select("serial")
        .single();
  
      if (error || !data) {
        console.log("Error adding class:", error);
        setMessage("Error adding class. Please try again.");
        setLoading(false);
        return;
      }
  
      const classId = data?.serial;
      if (!classId) {
        setLoading(false);
        return;
      }
  
      // ✅ Success Message
      setMessage(`Class named (${form.class_name}) in ${form.class_grade} has been created!`);
      setForm({ class_grade: "", class_name: "", class_size: 0, class_description: "" });
      onClassAdded();
  
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
          onClick={() => handleNavigation("/class")}
          disabled={loadingLink !== null}
          className={`flex items-center text-gray-500 px-4 py-2 rounded hover:bg-red-300 hover:text-red-900 ${
            loadingLink === "/class" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/class" ? <Loader2 className="animate-spin" size={20} /> : <ArrowLeft size={20} />}
          &nbsp; Back to class
        </button>
      </div> */}

      <div className="flex justify-between items-center mb-4">
        <Heading>Add class</Heading>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
      <select 
          className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.class_grade} 
          onChange={(e) => setForm({ ...form, class_grade: e.target.value })} required
          disabled={loading}
        >
          <option value="" disabled>Select Grade</option>
          <option value="Kg">Kg </option>
          <option value="pre-k1">pre-k1</option>
          <option value="pre-k2">pre-k2</option>
          <option value="Grade 1">Grade 1</option>
          <option value="Grade 2">Grade 2</option>
          <option value="Grade 3">Grade 3</option>
          <option value="Grade 4">Grade 4</option>
          <option value="Grade 5">Grade 5</option>
          <option value="Grade 6">Grade 6</option>
          <option value="Grade 7">Grade 7</option>
          <option value="Grade 8">Grade 8</option>
          <option value="Grade 9">Grade 9</option>
          <option value="Grade 10">Grade 10</option>
          <option value="Grade 11">Grade 11</option>
          <option value="Grade 12">Grade 12</option>
        </select>
        <select 
          className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.class_name} 
          onChange={(e) => setForm({ ...form, class_name: e.target.value })} required
          disabled={loading}
        >
          <option value="" disabled>Class Branch</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
          <option value="F">F</option>
        </select>
        <label className="text-yellow-600">Specify limit</label>
        <input 
          type="number" placeholder="Last Name" 
          className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.class_size} 
          onChange={(e) => setForm({ ...form, class_size: Number(e.target.value) || 0 })} 
          required 
          disabled={loading}
        />
        <input 
          type="text" placeholder="Description (optional" 
          className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.class_description} 
          onChange={(e) => setForm({ ...form, class_description: e.target.value })}  
          disabled={loading}
        /> 
        <button 
          type="submit" 
          className={`w-full flex justify-center items-center gap-2 bg-green-200 text-lg text-green-800 px-4 py-2 rounded hover:bg-green-600 hover:text-green-100 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Add class"}
        </button>
      </form>
      {message && <p className="mt-6 text-green-500 text-xl font-mono">{message}</p>}
    </div>
  );
}
