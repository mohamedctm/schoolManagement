"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Student } from "@/types/student";
import { Class, Assignment } from "@/types/class";
import Heading from "@/components/Heading";
import { ArrowLeft, Plus, Upload, ChevronDown, ChevronUp } from "lucide-react";
import countries from "world-countries";
import { useRouter } from "next/navigation";

interface EditStudentFormProps {
  id: string;
}

const initialClassState: Class = {
  serial: 0,
  create_at: "",
  class_grade: "",
  class_name: "",
  class_size: 0,
  class_description: "",
};

const initialAssignState: Assignment = {
  assigned_serial: 0,
  created_at: "",
  student_id: 0,
  class_id: 0,
};

const initialStudentState: Student = {
  id: 0,
  first_name: "",
  middle_name: "",
  last_name: "",
  birth_date: "",
  gender: "",
  enrollment_status: false,
};

export default function EditStudentForm({ id }: EditStudentFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [found, setFound] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [assign, setAssign] = useState<Assignment>(initialAssignState);
  const [student, setStudent] = useState<Student>(initialStudentState);
  const [classes, setClass] = useState<Class>(initialClassState);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [expandedSection1, setExpandedSection1] = useState<string | null>("");
  const [showNeverAssigned, setShowNeverAssigned] = useState(true); // Toggle for never-assigned students

  const toggleSection1 = (section: string) => {
    setExpandedSection1(expandedSection1 === section ? null : section);
  };

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
        const assignedToOtherClasses = studentsData.filter(
          (s) =>
            assignmentsData.map((a) => a.student_id).includes(s.id) &&
            !assignedStudentIds.includes(s.id)
        );

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

  const countNullValues = (record: Record<string, any>) => {
    return Object.values(record).filter((value) => value === null || value === "").length;
  };

  const HandleDeleteClass = async (id: number) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
  
    try {
      // Check if there are any students assigned to the class
      const { data: assignedStudents, error: fetchError } = await supabase
        .from("assignment")
        .select("student_id")
        .eq("class_id", id);
  
      if (fetchError) throw fetchError;
  
      if (assignedStudents && assignedStudents.length > 0) {
        setMessage("This class has students assigned to it and cannot be removed.");
        return;
      }
  
      // Proceed to delete the class if no students are assigned
      const { error: classError } = await supabase
        .from("classroom")
        .delete()
        .eq("serial", id);
  
      if (classError) throw classError;
  
      setMessage("Class deleted successfully.");
      router.push("/class");
    } catch (error) {
      console.log("Error deleting class:", error);
      setMessage("An error occurred while deleting the class.");
    }
  };
  
  const handleUpdate = async () => {
    setUpdateLoading(true);
    if (!student || !classes) return;

    try {
      const updateTable = async (table: string, data: any) => {
        const { error } = await supabase.from(table).update(data).eq("serial", id);
        if (error) throw error;
      };

      await Promise.all([
        updateTable("classroom", {
          class_size: classes.class_size,
          class_description: classes.class_description,
        }),
      ]);

      setMessage("Class details updated!");
      setUpdateLoading(false);
    } catch (error) {
      console.log("Error updating class data:", error);
      setMessage("Failed to update class details.");
      setUpdateLoading(false);
    }
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
        <Heading>Manage class</Heading>
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
        <div className="w-full sm:w-full lg:w-[35%] bg-white shadow-lg rounded-lg p-6">
          <p className="text-green-600 text-xl font-normal mb-4"> {message && <span>{message}</span>}</p>
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection1("basic")}>
            <h2 className={`w-fit px-4 py-2 rounded mt-4 transition  ${
              expandedSection1 === "basic" ? "text-black " : "text-gray-500"
            }`}> <span className="text-2xl text-black font-bold">{classes.class_grade} ({classes.class_name})</span> <span className={`w-fit px-4 py-2 rounded mt-4 transition 
                ${countNullValues(classes) > 0 ? "text-red-600" : "text-green-600"}`}>
                 {countNullValues(classes) > 0 ? "Incomplete" : "Complete"}
              </span></h2>
            {expandedSection1 === "basic" ? <ChevronUp /> : <ChevronDown />}
          </div>
          {expandedSection1 === "basic" && (
            <div className="mt-4 border border-gray-300 rounded-lg p-6">
              <p className="text-lg text-gray-800">{classes.class_grade} Branch : {classes.class_name}</p>
              <label>Size </label>
              <input type="number" placeholder="Change limit" className="w-full p-2 border border-gray-300 rounded mb-2" value={classes?.class_size || 0} onChange={(e) => setClass({ ...classes, class_size: Number(e.target.value) })} />
              <label>Description</label>
              <input type="text" placeholder="Description" className="w-full p-2 border border-gray-300 rounded mb-2" value={classes?.class_description || ""} onChange={(e) => setClass({ ...classes, class_description: e.target.value })} />
            </div>
          )}
          <div className="bg-white text-gray-700 gap-2 p-5 flex justify-between border-b border-white">
            <button onClick={handleUpdate} className="w-fit bg-green-200 text-green-800 px-4 py-2 rounded hover:bg-green-600 hover:text-white mt-4">
              {!updateLoading ? 'Update Record' : 'updating..'}
            </button>
          </div>
        </div>
      </div>

      <p className="py-12 text-gray-400">&nbsp;Warning: Deleting a class is permanent and cannot be undone.<br/>
         Consider removing All student before proceeding.</p>
      <div className="bg-white text-gray-700 gap-2 p-5 flex justify-between border-b border-white">
        <button
          onClick={() => HandleDeleteClass(classes.serial)}
          className="w-fit bg-gray-600 text-white px-4 py-2 rounded hover:bg-red-500 mt-4"
        >
          Delete Class
        </button>
      </div>
      <p className="py-10">&nbsp;</p>
    </div>
  );
}