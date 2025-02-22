"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Student } from "@/types/student";
import { Class } from "@/types/class";
import Heading from "@/components/Heading";
import { ArrowLeft } from "lucide-react";

interface EditStudentFormProps {
  id: string;
}

const initialClassState: Class = {
  serial: 0,
  create_at: "",
  class_grade: 0,
  class_name: "",
  class_size: 0,
  class_description: "",
};

export default function EditStudentForm({ id }: EditStudentFormProps) {

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [found, setFound] = useState(true);
  const [classes, setClass] = useState<Class>(initialClassState);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [showNeverAssigned, setShowNeverAssigned] = useState(true); // Toggle for never-assigned students



  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const classId = Number(id);

        const { data: studentExists, error: studentCheckError } = await supabase
          .from("classroom")
          .select("*")
          .eq("serial", classId)
          .single();

        if (studentCheckError || !studentExists) {
          setMessage("Class with specified ID not found.");
          setLoading(false);
          setFound(false);
          return;
        }

        const fetchTableData = async (table: string) => {
          const { data, error } = await supabase.from(table).select("*").eq("serial", classId).single();
          if (error) throw error;
          return data;
        };

        const [clsData] = await Promise.all([fetchTableData("classroom")]);

        setClass(clsData);

        // Fetch all students
        const { data: studentsData, error: studentsError } = await supabase
          .from("students")
          .select("*")
          .order("first_name", { ascending: true });
        if (studentsError) throw studentsError;

        // Fetch all assignments
        const { data: assignmentsData, error: assignmentsError } = await supabase.from("assignment").select("*");
        if (assignmentsError) throw assignmentsError;

        // Students assigned to this class
        const assignedStudentIds = assignmentsData
          .filter((a) => a.class_id === classId)
          .map((a) => a.student_id);
        const assignedStudentsList = studentsData.filter((s) => assignedStudentIds.includes(s.id));
        setAssignedStudents(assignedStudentsList);

        // Students not assigned to any class
        const neverAssignedStudents = studentsData.filter(
          (s) => !assignmentsData.map((a) => a.student_id).includes(s.id)
        );

        // Students assigned to other classes
        

        // Default: Show never-assigned students
        setUnassignedStudents(neverAssignedStudents);
        setStudents(studentsData);
      } catch (error) {
        console.log("Error fetching class data:", error);
        setMessage("Failed to fetch class info data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

  // Update unassigned students list when toggle changes
  useEffect(() => {
    if (students.length === 0) return;

    const fetchAssignments = async () => {
      const { data: assignmentsData, error: assignmentsError } = await supabase.from("assignment").select("*");
      if (assignmentsError) throw assignmentsError;

      const assignedStudentIds = assignmentsData
        .filter((a) => a.class_id === classes.serial)
        .map((a) => a.student_id);

      if (showNeverAssigned) {
        // Show students never assigned to any class
        const neverAssignedStudents = students.filter(
          (s) => !assignmentsData.map((a) => a.student_id).includes(s.id)
        );
        setUnassignedStudents(neverAssignedStudents);
      } else {
        // Show students assigned to other classes
        const assignedToOtherClasses = students.filter(
          (s) =>
            assignmentsData.map((a) => a.student_id).includes(s.id) &&
            !assignedStudentIds.includes(s.id)
        );
        setUnassignedStudents(assignedToOtherClasses);
      }
    };

    fetchAssignments();
  }, [showNeverAssigned, students, classes.serial]);

  const handleStudentSelection = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleAssignStudents = async () => {
    if (selectedStudents.length === 0) {
      setMessage("No students selected.");
      return;
    }

    // Check if class size limit is exceeded
    if (assignedStudents.length + selectedStudents.length > classes.class_size) {
      setMessage("Class size limit exceeded.");
      return;
    }

    try {
      for (const studentId of selectedStudents) {
        // Check if the student is already assigned to any class
        const { data: existingAssignment, error: fetchError } = await supabase
          .from("assignment")
          .select("*")
          .eq("student_id", studentId)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError; // Ignore "No rows found" error
        }

        if (existingAssignment) {
          // Update the existing assignment
          const { error: updateError } = await supabase
            .from("assignment")
            .update({ class_id: classes.serial })
            .eq("student_id", studentId);

          if (updateError) throw updateError;
        } else {
          // Insert a new assignment
          const { error: insertError } = await supabase.from("assignment").insert([
            {
              student_id: studentId,
              class_id: classes.serial,
              created_at: new Date().toISOString(),
            },
          ]);

          if (insertError) throw insertError;
        }
      }

      setMessage("Students assigned successfully!");
      setSelectedStudents([]);

      // Refresh the lists
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("*")
        .order("first_name", { ascending: true });
      if (studentsError) throw studentsError;

      const { data: assignmentsData, error: assignmentsError } = await supabase.from("assignment").select("*");
      if (assignmentsError) throw assignmentsError;

      const assignedStudentIds = assignmentsData
        .filter((a) => a.class_id === classes.serial)
        .map((a) => a.student_id);
      const assignedStudentsList = studentsData.filter((s) => assignedStudentIds.includes(s.id));
      setAssignedStudents(assignedStudentsList);

      const neverAssignedStudents = studentsData.filter(
        (s) => !assignmentsData.map((a) => a.student_id).includes(s.id)
      );
      const assignedToOtherClasses = studentsData.filter(
        (s) =>
          assignmentsData.map((a) => a.student_id).includes(s.id) &&
          !assignedStudentIds.includes(s.id)
      );

      // Update unassigned students based on toggle
      setUnassignedStudents(showNeverAssigned ? neverAssignedStudents : assignedToOtherClasses);
    } catch (error) {
      console.log("Error assigning students:", error);
      setMessage("Failed to assign students.");
    }
  };

  const HandleDeleteStudent = async (studentId: number) => {
    if (!confirm("Are you sure you want to remove student from class?")) return;

    try {
      const { error } = await supabase.from("assignment").delete().eq("student_id", studentId);
      if (error) throw error;
      setMessage("Student removed from class.");

      // Refresh the lists
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("*")
        .order("first_name", { ascending: true });
      if (studentsError) throw studentsError;

      const { data: assignmentsData, error: assignmentsError } = await supabase.from("assignment").select("*");
      if (assignmentsError) throw assignmentsError;

      const assignedStudentIds = assignmentsData
        .filter((a) => a.class_id === classes.serial)
        .map((a) => a.student_id);
      const assignedStudentsList = studentsData.filter((s) => assignedStudentIds.includes(s.id));
      setAssignedStudents(assignedStudentsList);

      const neverAssignedStudents = studentsData.filter(
        (s) => !assignmentsData.map((a) => a.student_id).includes(s.id)
      );
      const assignedToOtherClasses = studentsData.filter(
        (s) =>
          assignmentsData.map((a) => a.student_id).includes(s.id) &&
          !assignedStudentIds.includes(s.id)
      );

      // Update unassigned students based on toggle
      setUnassignedStudents(showNeverAssigned ? neverAssignedStudents : assignedToOtherClasses);
    } catch (error) {
      console.log("Error removing student:", error);
      setMessage("Failed to remove student.");
    }
  };
  
  const formatGrade = (grade: number) => {
    if (grade === 15) return "KG";
    if (grade === 13) return "Pre-K 1";
    if (grade === 14) return "Pre-K 2";
    return `Grade ${grade}`;
  };
  if (loading) return <p>Loading...</p>;
  return !found ? (
    <p className="text-l text-center py-20 text-gray-500">
      Student with specified ID not found.<br /> click on dashboard icon
    </p>
  ) : (
    <div className="p-6 w-full mx-auto py-5 h-screen">
      <div className="flex justify-between items-center mb-4">
        <Link href="/class" className="bg-white flex items-center text-gray-500 px-4 py-2 rounded hover:bg-red-300 hover:text-red-900">
          <ArrowLeft size={20} /> &nbsp; back to Class
        </Link>
      </div>
      <div className="flex justify-between items-center mb-4">
        <Heading>Manage -  <span>{formatGrade(Number(classes.class_grade))} {classes.class_name}</span></Heading>
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-6 justify-center md:justify-start w-[99%]">
        {/* Unassigned Students List */}
        <div className="w-full sm:w-full lg:w-[35%] bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-semibold text-orange-500 mb-4">Assign Students</h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setShowNeverAssigned(true)}
              className={`px-4 py-2 rounded ${
                showNeverAssigned ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-800"
              }`}
            >
              Never Assigned
            </button>
            <button
              onClick={() => setShowNeverAssigned(false)}
              className={`px-4 py-2 rounded ${
                !showNeverAssigned ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-800"
              }`}
            >
              Assigned to Other Classes
            </button>
          </div>
          <div className="mt-4 border border-gray-300 rounded-lg p-6">
            <p className="text-green-600 text-xl font-normal mb-4"> {message && <span>{message}</span>}</p>
            <div className="relative h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 p-6 bg-white shadow rounded-lg">
              {unassignedStudents.map((student) => (
                <div key={student.id} className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleStudentSelection(student.id)}
                    className="mr-4"
                  />
                  <span>{student.first_name} {student.last_name}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleAssignStudents}
              className="w-fit bg-blue-200 text-blue-800 px-4 py-2 rounded hover:bg-blue-600 hover:text-white mt-4"
            >
              Assign Selected Students
            </button>
          </div>
        </div>

        {/* Assigned Students List */}
        <div className="w-full sm:w-full lg:w-[35%] bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-cyan-700">Assigned Students</h2>
          <div className="mt-4 border border-gray-300 rounded-lg p-6">
            <div className="relative h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 p-6 bg-white shadow rounded-lg">
              {assignedStudents.map((student) => (
                <div key={student.id} className="flex items-center mb-4">
                  <button
                    onClick={() => HandleDeleteStudent(student.id)}
                    className="w-fit size-.9 font-medium bg-gray-600 text-white px-4 py-1 rounded hover:bg-red-500 mt-4"
                  >
                    &times;
                  </button>
                  <span className="py-2 px-8">{student.first_name} {student.last_name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Class Information */}
      </div>
      <p className="py-10">&nbsp;</p>
    </div>
  );
}