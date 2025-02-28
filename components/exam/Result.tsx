"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Loader2 } from "lucide-react";

interface ResultProps {
  id: string;
}

export default function Result({ id }: ResultProps) {
  const unique_id = id;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadingLink, setLoadingLink] = useState<string | null>(null);

  const [students, setStudents] = useState<
    {
      student_id: string;
      first_name: string;
      last_name: string;
      result: string;
      passStatus: string;
    }[]
  >([]);

  const [examInfo, setExamInfo] = useState({
    class_name: "",
    class_grade: 0,
    subject_name: "",
    full_mark: 0,
    pass: 0,
    status: true, // Default to true (editable), updated on fetch
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!unique_id) return;

        // Fetch exam assignments
        const { data: assignmentData, error: assignmentError } = await supabase
          .from("exam_assignment")
          .select("*")
          .eq("unique_id", unique_id);

        if (assignmentError) throw assignmentError;
        if (!assignmentData || assignmentData.length === 0) return;

        // Fetch exam details including status
        const { data: examData, error: examError } = await supabase
          .from("myexam")
          .select("class_id, subject_id, full_mark, pass, status")
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

        // Set exam info including status
        setExamInfo({
          class_name: classData.class_name || "",
          class_grade: classData.class_grade || 0,
          subject_name: subjectData.subject_name || "",
          full_mark: examData.full_mark || 0,
          pass: examData.pass || 0,
          status: examData.status ?? true, // Ensure fallback to true if status is null
        });

        // Fetch student details
        const studentsWithDetails = await Promise.all(
          assignmentData.map(async (assignment) => {
            const { data: studentData, error: studentError } = await supabase
              .from("students")
              .select("first_name, last_name")
              .eq("id", assignment.student_id)
              .order("first_name",{ascending: true})
              .order("last_name",{ascending: true})
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
              passStatus,
            };
          })
        );

        setStudents(studentsWithDetails);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [unique_id]);

  // Handle result change
  const handleResultChange = (student_id: string, value: string) => {
    if (!examInfo.status) return; // Prevent modification if status is false

    const numericValue = value ? Math.min(parseFloat(value), examInfo.full_mark) : "";

    setStudents((prev) =>
      prev.map((student) => {
        const result = Number(numericValue) || 0;
        const passMark = (examInfo.full_mark * examInfo.pass) / 100;
        const passStatus = result >= passMark ? "Pass" : "Fail";

        return student.student_id === student_id
          ? { ...student, result: numericValue.toString(), passStatus }
          : student;
      })
    );
  };

  // Submit updated results
  const handleSubmit = async () => {
    try {
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

  // Submit exam (send results to administrator)
  const submitExam = async () => {
    if (!confirm("Are you sure you want to submit the exam? Results will be sent to the administrator and locked.")) return;

    try {
      const { error } = await supabase
        .from("myexam")
        .update({ status: false })
        .eq("id", unique_id);

      if (error) throw error;

      setExamInfo((prev) => ({ ...prev, status: false }));
      alert("Exam submitted successfully! Results are now locked and sent to the administrator.");
    } catch (error) {
      console.error("Error submitting exam:", error);
      alert("Failed to submit exam.");
    }
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
          &nbsp;Back to Exams
        </button>
      </div>

      <div className="max-w-lg mx-auto p-6 bg-white shadow-lg border border-gray-300 rounded-lg">
        {/* Exam Information */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {examInfo.class_name} - Grade {examInfo.class_grade}
          </h2>
          <p className="text-gray-500 text-lg">{examInfo.subject_name}</p>
          <p className="text-gray-800 mt-2">
            <strong>Full Mark:</strong> {examInfo.full_mark} | <strong>Pass:</strong> {examInfo.pass}%
          </p>
          <p className="text-gray-800 mt-2">
            <strong>Status:</strong>{" "}
            <span className={examInfo.status ? "text-green-600" : "text-red-600"}>
              {examInfo.status ? "Open" : "Closed"}
            </span>
          </p>
        </div>

        {/* Student Results Table */}
        <div className="space-y-4">
          {students.map((student) => (
            <div key={student.student_id} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow-sm">
              <span className="text-gray-800 font-medium">{student.first_name} {student.last_name}</span>
              <input
                type="number"
                min="0"
                max={examInfo.full_mark}
                value={student.result}
                onChange={(e) => handleResultChange(student.student_id, e.target.value)}
                className="w-20 text-center border border-gray-300 rounded-lg p-2"
                disabled={!examInfo.status}
              />
            </div>
          ))}
        </div>

        <button onClick={handleSubmit} className="w-full mt-4 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-700 transition">
          Update Records
        </button>
        <p className="p-4 text-gray-500 text-m">warning: Teacher can no longer edit students result once the exam is submitted. proceed with caution</p>

        {examInfo.status && (
          <button onClick={submitExam} className="w-full mt-4 bg-red-500 text-white py-3 rounded-lg hover:bg-red-700 transition">
            Submit Exam
          </button>
        )}
      </div>
    </>
  );
}

