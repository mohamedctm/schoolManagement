"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import Heading from "@/components/Heading";

export default function ExamPage() {
  const [form, setForm] = useState({
    exam_name: "",
    exam_type: "",
    exam_year: new Date().getFullYear(),
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      // ✅ Check if the exam already exists
      const { data: existingExam, error: checkError } = await supabase
        .from("exam")
        .select("serial")
        .eq("exam_name", form.exam_name)
        .eq("exam_type", form.exam_type)
        .eq("exam_year", form.exam_year)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingExam) {
        setMessage("Exam already exists for this year.");
        setLoading(false);
        return;
      }

      // ✅ Insert the new exam
      const { error } = await supabase.from("exam").insert([
        {
          exam_name: form.exam_name,
          exam_type: form.exam_type,
          exam_year: form.exam_year,
        },
      ]);

      if (error) {
        throw error;
      }

      // ✅ Success message & clear form
      setMessage("Exam created successfully!");
      setForm({ exam_name: "", exam_type: "", exam_year: new Date().getFullYear() });

      // Hide message after 3s
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error creating exam. Please try again.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto h-fit">
      <div className="text-center w-full mb-4">
        <Heading>Create Exam</Heading>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
        {/* Exam Name */}
        <input
          type="text"
          name="exam_name"
          placeholder="Exam Name"
          value={form.exam_name}
          onChange={handleChange}
          required
          className="w-full p-3 border border-gray-300 rounded mb-3"
          disabled={loading}
        />

        {/* Exam Type */}
        <select
          name="exam_type"
          value={form.exam_type}
          onChange={handleChange}
          required
          className="w-full p-3 border border-gray-300 rounded mb-3"
          disabled={loading}
        >
          <option value="">Select Exam Type</option>
          <option value="Midterm">Midterm</option>
          <option value="Final">Final</option>
          <option value="Quiz">Quiz</option>
        </select>

        {/* Exam Year */}
        <input
          type="number"
          name="exam_year"
          value={form.exam_year}
          onChange={handleChange}
          required
          className="w-full p-3 border border-gray-300 rounded mb-3"
          disabled={loading}
        />

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full flex justify-center items-center gap-2 bg-blue-700 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Exam"}
        </button>
      </form>

      {/* Message Popup */}
      {message && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-3 rounded-lg shadow-md transition-opacity duration-300">
          {message}
        </div>
      )}
    </div>
  );
}
