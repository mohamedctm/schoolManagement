"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Loader2} from "lucide-react";

interface ResultProps {
  id: string; // `unique_id` from exam_assignment table
}

export default function Result({ id }: ResultProps) {
  const unique_id = id; // unique_id in exam_assignment table
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadingLink, setLoadingLink] = useState<string | null>(null);


  const [students, setStudents] = useState<
    {
      student_id: string;
      first_name: string;
      last_name: string;
      result: string;
      passStatus: string; // "Pass" or "Fail"
    }[]
  >([]);

  const [examInfo, setExamInfo] = useState({
    class_name: "",
    class_grade: 0,
    subject_name: "",
    full_mark: 0, // Total marks for the exam
    pass: 0, // Pass percentage for the exam
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!unique_id) return;

        // Fetch all exam assignments for the given `unique_id`
        const { data: assignmentData, error: assignmentError } = await supabase
          .from("exam_assignment")
          .select("*")
          .eq("unique_id", unique_id);

        if (assignmentError) throw assignmentError;

        if (!assignmentData || assignmentData.length === 0) {
          console.log("No students found for this exam.");
          return;
        }

        // Fetch exam details (class_id, subject_id, full_mark, pass) from `myexam`
        const { data: examData, error: examError } = await supabase
          .from("myexam")
          .select("class_id, subject_id, full_mark, pass")
          .eq("id", unique_id)
          .single();

        if (examError) throw examError;

        // Fetch class details
        const { data: classData, error: classError } = await supabase
          .from("classroom")
          .select("class_name, class_grade")
          .eq("serial", examData.class_id)
          .single();

        if (classError) throw classError;

        // Fetch subject name
        const { data: subjectData, error: subjectError } = await supabase
          .from("subjects")
          .select("subject_name")
          .eq("id", examData.subject_id)
          .single();

        if (subjectError) throw subjectError;

        // Set exam info
        setExamInfo({
          class_name: classData.class_name || "",
          class_grade: classData.class_grade || 0,
          subject_name: subjectData.subject_name || "",
          full_mark: examData.full_mark || 0,
          pass: examData.pass || 0,
        });

        // Fetch student details for each assignment
        const studentsWithDetails = await Promise.all(
          assignmentData.map(async (assignment) => {
            const { data: studentData, error: studentError } = await supabase
              .from("students")
              .select("first_name, last_name")
              .eq("id", assignment.student_id)
              .single();

            if (studentError) throw studentError;

            // Calculate pass/fail status
            const result = parseFloat(assignment.result) || 0;
            const passMark = (examData.full_mark * examData.pass) / 100;
            const passStatus = result >= passMark ? "Pass" : "Fail";

            return {
              student_id: assignment.student_id,
              first_name: studentData.first_name || "",
              last_name: studentData.last_name || "",
              result: assignment.result || "",
              passStatus, // "Pass" or "Fail"
            };
          })
        );

        setStudents(studentsWithDetails);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    fetchData();
  }, [unique_id]);

  // Handle result change for a specific student
  const handleResultChange = (student_id: string, value: string) => {
    setStudents((prev) =>
      prev.map((student) => {
        const result = parseFloat(value) || 0;
        const passMark = (examInfo.full_mark * examInfo.pass) / 100;
        const passStatus = result >= passMark ? "Pass" : "Fail";

        return student.student_id === student_id
          ? { ...student, result: value, passStatus }
          : student;
      })
    );
  };

  // Submit all updated results
  const handleSubmit = async () => {
    try {
      // Update results for all students
      await Promise.all(
        students.map(async (student) => {
          await supabase
            .from("exam_assignment")
            .update({ result: student.result })
            .eq("unique_id", unique_id)
            .eq("student_id", student.student_id);
        })
      );

      alert("Results updated successfully!");
      router.refresh();
    } catch (error) {
      alert("Failed to update results.");
      console.error(error);
    }
  };
  const formatGrade = (grade: number) => {
    if (grade === 15) return "KG";
    if (grade === 13) return "Pre-K 1";
    if (grade === 14) return "Pre-K 2";
    return `Grade ${grade}`;
  };
  return (
    <>
    <div className="flex justify-between items-center mb-6">
      <button
          onClick={() => {
            setLoadingLink("/exam");
            router.push("/exam");
          }}
          disabled={loadingLink !== null}
          className={`flex items-center text-gray-500 px-3 py-2 rounded hover:bg-red-300 hover:text-red-900 transition ${
            loadingLink === "/exam" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/exam" ? <Loader2 className="animate-spin" size={20} /> : <ArrowLeft size={20} />}
          &nbsp;back to exams
        </button>
      </div>
          <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Exam Information */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {examInfo.class_name} - {formatGrade(examInfo.class_grade)}
        </h2>
        <p className="text-gray-500 text-lg">{examInfo.subject_name}</p>
      </div>
  
      {/* Student Results Table */}
      <div className="space-y-4">
        {students.map((student) => (
          <div
            key={student.student_id}
            className="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow-sm"
          >
            <div className="flex flex-col">
              <span className="text-gray-800 font-medium">
                {student.first_name} {student.last_name}
              </span>
              <span
                className={`text-m font-light ${
                  student.passStatus === "Pass" ? "text-green-600" : "text-red-600"
                }`}
              >
                {student.passStatus}
              </span>
            </div>
            <input
              type="text"
              placeholder="Result"
              value={student.result}
              onChange={(e) => handleResultChange(student.student_id, e.target.value)}
              className="w-20 text-center border border-gray-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ))}
      </div>
  
      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="w-full mt-6 bg-blue-200 text-blue-600 hover:bg-blue-600 hover:text-blue-100 py-3 rounded-lg text-lg font-semibold transition duration-300"
      >
        Update Records
      </button>
    </div>
    </>
  );
  
}