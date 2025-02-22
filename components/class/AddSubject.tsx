"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Heading from "@/components/Heading";
import { Loader2 } from "lucide-react";
interface AddSubjectPageProps {
  onClassAdded: () => void; // Callback function for updating the main list
}
export default function AddSubjectPage({ onClassAdded }: AddSubjectPageProps) {
  const [form, setForm] = useState({
    subject_name: "",
  
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
      // ✅ Step 1: Check if the subject already exists
      const { data: existingClass, error: checkError } = await supabase
        .from("subjects")
        .select("subject_name")
        .eq("subject_name", form.subject_name)
        .single();
  
      if (checkError && checkError.code !== "PGRST116") {
        console.log("Error checking existing subject:", checkError);
        setMessage("Error checking subject existence. Please try again.");
        setLoading(false);
        return;
      }
  
      if (existingClass) {
        setMessage(`Subject (${form.subject_name}) already exists!`);
        setLoading(false);
        return;
      }
  
      // ✅ Step 2: Insert subject data if not exists
      const { data, error } = await supabase
        .from("subjects")
        .insert([{ ...form }])
        .select("id")
        .single();
  
      if (error || !data) {
        console.log("Error adding subject:", error);
        setMessage("Error adding subject. Please try again.");
        setLoading(false);
        return;
      }
  
      const classId = data?.id;
      if (!classId) {
        setLoading(false);
        return;
      }
  
      // ✅ Success Message
      setMessage(`subject named (${form.subject_name}) created!`);
      setForm({ subject_name: ""});
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
          onClick={() => handleNavigation("/subject")}
          disabled={loadingLink !== null}
          className={`flex items-center text-gray-500 px-4 py-2 rounded hover:bg-red-300 hover:text-red-900 ${
            loadingLink === "/subject" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/subject" ? <Loader2 className="animate-spin" size={20} /> : <ArrowLeft size={20} />}
          &nbsp; Back to subject
        </button>
      </div> */}

      <div className="flex justify-between items-center mb-4">
        <Heading>Add subject</Heading>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <input 
          type="text" placeholder="subject name" 
          className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={form.subject_name} 
          onChange={(e) => setForm({ ...form, subject_name: e.target.value || "" })} 
          required 
          disabled={loading}
        />
        <button 
          type="submit" 
          className={`w-full flex justify-center items-center gap-2 bg-green-200 text-lg text-green-700 px-4 py-2 rounded hover:bg-green-700 hover:text-green-100 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Add subject"}
        </button>
      </form>
      {message && <p className="mt-6 text-green-500 text-xl font-mono">{message}</p>}
    </div>
  );
}
