"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Class } from "@/types/class";
import { Student } from "@/types/student";
import Heading from "@/components/Heading";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditStudentFormProps {
  id: string;
}

export default function EditStudentForm({ id }: EditStudentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [found, setFound] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [currentAssignment, setCurrentAssignment] = useState<{ class_id: number | null; class_grade: string | null; class_name: string | null }>({
    class_id: null,
    class_grade: null,
    class_name: null,
  });

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentId = Number(id);

        // ✅ Fetch Student
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("*")
          .eq("id", studentId)
          .single();

        if (studentError || !studentData) {
          setMessage("Student not found.");
          setLoading(false);
          setFound(false);
          return;
        }
        setStudent(studentData);

        // ✅ Fetch Student's Current Class Assignment
        const { data: assignmentData, error: assignmentError } = await supabase
          .from("assignment")
          .select("class_id")
          .eq("student_id", studentId)
          .single();

        if (assignmentData) {
          const { data: classInfo, error: classError } = await supabase
            .from("classroom")
            .select("serial, class_grade, class_name")
            .eq("serial", assignmentData.class_id)
            .single();

          if (classInfo) {
            setCurrentAssignment({
              class_id: classInfo.serial,
              class_grade: classInfo.class_grade || "Unknown Grade",
              class_name: classInfo.class_name || "Unknown Class",
            });
            setSelectedClass(classInfo.serial);
          }
        }

        // ✅ Fetch All Classes
        const { data: classData, error: classError } = await supabase
          .from("classroom")
          .select("*")
          .order("class_grade", { ascending: true });

        if (classError) {
          setMessage("Error fetching classes.");
          return;
        }
        setClasses(classData);
      } catch (error) {
        console.log("Error fetching data:", error);
        setMessage("Failed to fetch student and class data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ✅ Handle Class Assignment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !student) {
      setMessage("Please select a class.");
      return;
    }

    setUpdateLoading(true);

    try {
      // ✅ Fetch the selected class's size limit
      const { data: selectedClassData, error: classError } = await supabase
        .from("classroom")
        .select("class_size")
        .eq("serial", selectedClass)
        .single();

      if (classError || !selectedClassData) {
        setMessage("Error fetching class details.");
        setUpdateLoading(false);
        return;
      }

      const classSizeLimit = selectedClassData.class_size;

      // ✅ Fetch the current number of students assigned to the selected class
      const { count: currentStudentCount, error: countError } = await supabase
        .from("assignment")
        .select("*", { count: "exact", head: true })
        .eq("class_id", selectedClass);

      if (countError) {
        setMessage("Error fetching current class size.");
        setUpdateLoading(false);
        return;
      }

      // ✅ Check if class size limit is reached
      if (currentStudentCount !== null && currentStudentCount >= classSizeLimit) {
        setMessage("Class size limit reached. Cannot assign more students.");
        setUpdateLoading(false);
        return;
      }

      // ✅ Check if student already has an assignment
      const { data: existingAssignment, error: checkError } = await supabase
        .from("assignment")
        .select("assigned_serial")
        .eq("student_id", student.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.log("Error checking assignment:", checkError);
        setMessage("Error checking assignment.");
        setUpdateLoading(false);
        return;
      }

      if (existingAssignment) {
        // ✅ If record exists, update it
        const { error: updateError } = await supabase
          .from("assignment")
          .update({ class_id: selectedClass })
          .eq("student_id", student.id);

        if (updateError) {
          console.log("Error updating assignment:", updateError);
          setMessage("Error updating student assignment.");
          setUpdateLoading(false);
          return;
        }

        setMessage("Student's class updated successfully!");
      } else {
        // ✅ If no record exists, insert new assignment
        const { error: insertError } = await supabase.from("assignment").insert([
          {
            student_id: student.id,
            class_id: selectedClass,
          },
        ]);

        if (insertError) {
          console.log("Error assigning student:", insertError);
          setMessage("Error assigning student to class.");
          setUpdateLoading(false);
          return;
        }

        setMessage("Student assigned successfully!");
      }

      setCurrentAssignment({
        class_id: selectedClass,
        class_grade: classes.find((c) => c.serial === selectedClass)?.class_grade || "Updated Grade",
        class_name: classes.find((c) => c.serial === selectedClass)?.class_name || "Updated Class",
      });
    } catch (error) {
      console.log("Unexpected error:", error);
      setMessage("An unexpected error occurred.");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  return !found ? (
    <p className="text-center py-20 text-gray-500">
      Student not found.<br /> Click on the dashboard icon to return.
    </p>
  ) : (
    <div className="p-6 max-w-4xl mx-auto h-screen">
      <div className="flex justify-between items-center mb-4">
        <Link href="/students" className="bg-white flex items-center text-gray-500 px-4 py-2 rounded hover:bg-red-300 hover:text-red-900">
          <ArrowLeft size={20} /> &nbsp; Back to Students
        </Link>
      </div>
      <div className="flex justify-between items-center mb-4">
        <Heading>Assign Student to Class</Heading>
      </div>
    <p className="text-lg text-yellow-700 px-5">current grade : {currentAssignment.class_grade} {currentAssignment.class_name}</p>
      <p className="text-green-600 text-xl font-normal mb-4">{message && <span>{message}</span>}</p>

      <form onSubmit={handleSubmit} className="bg-white w-[94%] md:w-[80%] sm:w-full shadow rounded-lg p-6">
        <label className="block text-green-800 text-lg font-medium mb-4">
          Assign Class to {student?.first_name} {student?.last_name}
        </label>
        <select
          className="w-full p-2 border border-gray-300 rounded mb-2"
          value={selectedClass ?? ""}
          onChange={(e) => setSelectedClass(Number(e.target.value) || null)}
          required
          disabled={updateLoading}
        >
          <option value="" disabled>Select Class</option>
          {classes.map((cls) => (
            <option key={cls.serial} value={cls.serial}>
              {cls.class_grade} - {cls.class_name}
            </option>
          ))}
        </select>

        <button type="submit" className={`w-full flex justify-center items-center gap-2 bg-green-200 text-lg text-green-800 px-4 py-2 rounded hover:bg-green-600 hover:text-white transition ${updateLoading ? "opacity-50 cursor-not-allowed" : ""}`} disabled={updateLoading}>
          {updateLoading ? <Loader2 className="animate-spin" size={20} /> : "Assign Student"}
        </button>
      </form>
    </div>
  );
}
