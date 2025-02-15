"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Student, Parents } from "@/types/student";
import Heading from "@/components/Heading";
import { ArrowLeft } from "lucide-react";
import BasicInfoSection from "@/components/students/BasicInfoSection";
import ParentInfoSection from "@/components/students/ParentInfoSection";
import AdditionalInfoSection from "@/components/students/AdditionalInfoSection";

interface EditStudentFormProps {
  id: string;
}

const initialStudentState: Student = {
  id: 0,
  first_name: "",
  middle_name: "",
  last_name: "",
  birth_date: "",
  gender: "",
  enrollment_status: false,
};

const initialParentsState: Parents = {
  id: 0, 
  parent_one_first_name: "",
  parent_one_last_name: "",
  parent_two_first_name: "",
  parent_two_last_name: "",
  parent_one_status: "",
  parent_two_status: "",
  parent_one_nationality: "",
  parent_two_nationality: "",
  parent_one_residency_status: "",
  parent_two_residency_status: "",
  address: "",
  address_country: "",
  phone_number1: "",
  phone_number2: "",
  emergency_fname: "",
  emergency_lname: "",
  emergency_number: "",
};

export default function EditStudentForm({ id }: EditStudentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [found, setFound] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [student, setStudent] = useState<Student>(initialStudentState);
  const [parents, setParents] = useState<Parents>(initialParentsState);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const studentId = Number(id);
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

        const { data: parentData, error: parentError } = await supabase
          .from("parents")
          .select("*")
          .eq("id", studentId)
          .single();

        if (parentError) throw parentError;

        setStudent(studentData);
        setParents(parentData);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setMessage("Failed to fetch student data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

  const handleUpdate = async () => {
    setUpdateLoading(true);
    try {
      await supabase.from("students").update(student).eq("id", id);
      await supabase.from("parents").update(parents).eq("id", id);
      setMessage("Student details updated successfully!");
    } catch (error) {
      console.error("Error updating student:", error);
      setMessage("Failed to update student details.");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!found) return <p className="text-l text-center py-20 text-gray-500">Student not found.</p>;

  return (
    <div className="p-6 w-full mx-auto h-screen">
      <div className="flex justify-between items-center mb-4">
        <Link href="/students" className="bg-white flex items-center text-gray-500 px-4 py-2 rounded hover:bg-red-300 hover:text-red-900">
          <ArrowLeft size={20} /> &nbsp; Back to Students
        </Link>
      </div>
      <div className="flex justify-between items-center mb-4">
        <Heading>Edit Student</Heading>
      </div>

      <p className="text-green-600 text-xl font-normal mb-4">{message}</p>

      <button
        onClick={handleUpdate}
        className="w-fit bg-green-200 text-green-800 px-4 py-2 rounded hover:bg-green-600 hover:text-white mt-4"
        disabled={updateLoading}
      >
        {updateLoading ? "Updating..." : "Update Student"}
      </button>

      {/* Student Info */}
      <BasicInfoSection student={student} setStudent={setStudent} />
      <ParentInfoSection title="Parent 1 Information" parentData={parents} setParents={setParents} parentKey="parent_one" />
      <ParentInfoSection title="Parent 2 Information" parentData={parents} setParents={setParents} parentKey="parent_two" />
      <AdditionalInfoSection title="additional info" parentData={parents} setParents={setParents} parentKey="parent_two" />
    </div>
  );
}
