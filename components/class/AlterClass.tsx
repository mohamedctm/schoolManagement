"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Heading from "@/components/Heading";
import { Loader2 } from "lucide-react";
import { Class } from "@/types/class";

interface AlterClassPageProps {
  onClassAdded: () => void;
  onClose: () => void; // Callback to refresh class list
  classid: number;
}

export default function AlterClassPage({ classid, onClose, onClassAdded }: AlterClassPageProps) {
  const [classDetails, setClassDetails] = useState<Class | null>(null);
  const [currentStudentCount, setCurrentStudentCount] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false); // Track deletion state

  useEffect(() => {
    if (!classid) return;

    const fetchClassDetails = async () => {
      setLoading(true);
      try {
        // ✅ Fetch class details
        const { data: classData, error: classError } = await supabase
          .from("classroom")
          .select("*")
          .eq("serial", classid)
          .single();

        if (classError || !classData) {
          setMessage("Error fetching class details.");
          setLoading(false);
          return;
        }

        setClassDetails(classData);

        // ✅ Fetch current number of assigned students
        const { count, error: assignmentError } = await supabase
          .from("assignment")
          .select("student_id", { count: "exact" })
          .eq("class_id", classid);

        if (assignmentError) {
          setMessage("Error fetching student count.");
          setLoading(false);
          return;
        }

        setCurrentStudentCount(count || 0);
      } catch (error) {
        setMessage("Failed to fetch class details.");
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [classid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !classDetails) return;

    // ✅ Ensure new class size is greater than or equal to the number of assigned students
    if (classDetails.class_size < currentStudentCount) {
      setMessage(`Error: Class size cannot be less than assigned students (${currentStudentCount}).`);
      return;
    }

    setLoading(true);
    try {
      // ✅ Update class details
      const { error } = await supabase
        .from("classroom")
        .update({
          class_size: classDetails.class_size,
          class_description: classDetails.class_description,
        })
        .eq("serial", classid);

      if (error) {
        setMessage("Error updating class details.");
        setLoading(false);
        return;
      }

      setMessage("Class updated successfully!");
      onClassAdded(); // Refresh main list
    } catch (error) {
      setMessage("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async () => {
    if (deleting || currentStudentCount > 0) return;
    if (!confirm("Are you sure you want to delete this class? This action cannot be undone.")) return;

    setDeleting(true);
    try {
      const { error } = await supabase.from("classroom").delete().eq("serial", classid);
      if (error) {
        setMessage("Error deleting class.");
        setDeleting(false);
        return;
      }

      setMessage("Class deleted successfully!");
      onClassAdded(); // Refresh class list
      onClose(); // ✅ Close modal after deletion
    } catch (error) {
      setMessage("Unexpected error occurred.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto h-fit">
      <div className="flex justify-between items-center mb-4">
        <Heading>Update Class Details</Heading>
      </div>

      {message && <p className="text-center text-red-500">{message}</p>}

      {classDetails ? (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          {/* ✅ Class Size Input */}
          <label className="text-gray-700 text-lg">Class Size (Min: {currentStudentCount})</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            value={classDetails.class_size}
            min={currentStudentCount} // Prevent reducing below assigned students
            onChange={(e) =>
              setClassDetails({ ...classDetails, class_size: Number(e.target.value) || 0 })
            }
            required
            disabled={loading}
          />

          {/* ✅ Class Description Input */}
          <label className="text-gray-700 text-lg">Class Description</label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded mb-4"
            value={classDetails.class_description || ""}
            onChange={(e) =>
              setClassDetails({ ...classDetails, class_description: e.target.value })
            }
            disabled={loading}
          />

          {/* ✅ Submit Button */}
          <button
            type="submit"
            className={`w-full flex justify-center items-center gap-2 bg-green-200 text-lg text-green-700 px-4 py-2 rounded hover:bg-green-700 hover:text-white transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Update Class"}
          </button>
        </form>
      ) : (
        <p className="text-center text-gray-500">Loading class details...</p>
      )}

      {/* ✅ Delete Section */}
      <div className="mt-6 bg-red-100 p-4 rounded-lg">
        <p className="text-center text-red-600 text-lg">
          All students must be unassigned before deleting this class.
        </p>
        <button
          onClick={handleDeleteClass}
          disabled={currentStudentCount > 0 || deleting}
          className={`w-full flex justify-center items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 mt-4 transition ${
            currentStudentCount > 0 || deleting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {deleting ? <Loader2 className="animate-spin" size={20} /> : "Delete Class"}
        </button>
      </div>
    </div>
  );
}
