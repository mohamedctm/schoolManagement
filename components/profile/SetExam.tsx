"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import Heading from "@/components/Heading";
import { Exam } from "@/types/exam"; // Consolidated types
import { Class, Subject } from "@/types/class"; // Consolidated types
import { useUser } from "@/context/UserContext";

export default function AssignExam() {
  const { user } = useUser(); // Get logged-in teacher ID
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);

  // ✅ New state variables for full_mark and pass
  const [examMark, setExamMark] = useState<number | null>(null);
  const [passPercentage, setPassPercentage] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Fetch Exams
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data, error } = await supabase.from("exam").select("*");
        if (error) throw error;
        setExams(data || []);
      } catch (error) {
        console.error("Error fetching exams:", error);
        setMessage("Failed to fetch exams.");
      }
    };
    fetchExams();
  }, []);

  // ✅ Fetch Classes assigned to the teacher
  useEffect(() => {
    if (!user?.id) return;

    const fetchClasses = async () => {
      try {
        const { data: assignedClasses, error: classError } = await supabase
          .from("teacher_assignment")
          .select("class_id")
          .eq("teacher_id", user.id);

        if (classError) throw classError;
        if (!assignedClasses || assignedClasses.length === 0) {
          setClasses([]);
          return;
        }

        const classIds = assignedClasses.map((c) => c.class_id);

        const { data: classData, error: classroomError } = await supabase
          .from("classroom")
          .select("*")
          .in("serial", classIds)
          .order("class_grade", { ascending: true });

        if (classroomError) throw classroomError;
        setClasses(classData || []);
      } catch (error) {
        console.error("Error fetching classes:", error);
        setMessage("Failed to fetch classes.");
      }
    };

    fetchClasses();
  }, [user]);

  // ✅ Fetch Subjects based on Selected Class
  useEffect(() => {
    if (!selectedClass) return;

    const fetchSubjects = async () => {
      try {
        const { data: subjectAssignments, error } = await supabase
          .from("subject_assignment")
          .select("subject_id")
          .eq("class_id", selectedClass);

        if (error) throw error;
        if (!subjectAssignments || subjectAssignments.length === 0) {
          setSubjects([]);
          return;
        }

        const subjectIds = subjectAssignments.map((s) => s.subject_id);

        const { data: subjectData, error: subjectError } = await supabase
          .from("subjects")
          .select("*")
          .in("id", subjectIds)
          .order("subject_name", { ascending: true });

        if (subjectError) throw subjectError;
        setSubjects(subjectData || []);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setMessage("Failed to fetch subjects.");
      }
    };

    fetchSubjects();
  }, [selectedClass]);

  // ✅ Handle Selection Changes
  const handleExamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedExam(Number(e.target.value));
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(Number(e.target.value));
    setSelectedSubject(null); // Reset subjects when class changes
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(Number(e.target.value));
  };

  // ✅ Handle Input Changes for full_mark and pass
  const handleExamMarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExamMark(Number(e.target.value));
  };

  const handlePassPercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassPercentage(Number(e.target.value));
  };

  // ✅ Assign Exam to Class
  const handleAssignExam = async () => {
    if (!selectedExam || !selectedClass || !selectedSubject || !examMark || !passPercentage) {
      setMessage("Please select an exam, class, subject, and provide exam mark and pass percentage.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      if (!user?.id) {
        setMessage("Error: User not found. Please log in.");
        setLoading(false);
        return;
      }

      const teacherId = user.id;

      // ✅ Step 1: Check if exam is already assigned to this class & subject
      const { data: existingExam, error: checkError } = await supabase
        .from("myexam")
        .select("*")
        .eq("class_id", selectedClass)
        .eq("exam_id", selectedExam)
        .eq("subject_id", selectedSubject)
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingExam) {
        setMessage("This subject is already assigned to the selected exam and class.");
        setLoading(false);
        return;
      }

      // ✅ Step 2: Insert into `myexam` with full_mark and pass
      const { data: insertedExam, error: insertExamError } = await supabase
        .from("myexam")
        .insert([
          {
            class_id: selectedClass,
            exam_id: selectedExam,
            subject_id: selectedSubject,
            teacher_id: teacherId,
            full_mark: examMark, // Add full_mark
            pass: passPercentage, // Add pass_percentage
          },
        ])
        .select()
        .single();

      if (insertExamError || !insertedExam) {
        throw insertExamError;
      }

      // ✅ Step 3: Fetch All Students Assigned to the Selected Class
      const { data: students, error: studentError } = await supabase
        .from("assignment")
        .select("student_id")
        .eq("class_id", selectedClass);

      if (studentError) throw studentError;
      if (!students || students.length === 0) {
        setMessage("No students found in this class.");

        // ✅ Rollback: Remove `myexam` entry if no students
        await supabase.from("myexam").delete().eq("id", insertedExam.id);

        setLoading(false);
        return;
      }

      // ✅ Step 4: Prepare Exam Assignment Entries with `unique_id`
      const examAssignments = students.map((s) => ({
        unique_id: insertedExam.id, // ✅ Using `unique_id` from `myexam`
        exam_id: selectedExam,
        class_id: selectedClass,
        student_id: s.student_id,
        result: null, // Default result
      }));

      // ✅ Step 5: Insert Data into `exam_assignment`
      const { error: insertError } = await supabase
        .from("exam_assignment")
        .insert(examAssignments);

      if (insertError) {
        console.error("❌ Error inserting exam_assignment:", insertError);

        // ✅ Rollback: Remove `myexam` entry if student assignment fails
        await supabase.from("myexam").delete().eq("id", insertedExam.id);

        throw insertError;
      }

      setMessage("Students assigned to exam successfully!");
    } catch (error) {
      console.error("❌ Error assigning exam:", error);
      setMessage("Error assigning students. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto h-fit">
      <div className="text-center w-full mb-4">
        <Heading>Assign Exam to Class</Heading>
      </div>

      {/* Message Popup */}
      {message && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-3 rounded-lg shadow-md transition-opacity duration-300">
          {message}
        </div>
      )}

      {/* Exam Selection */}
      <select
        className="w-full p-3 border border-gray-300 rounded mb-3"
        value={selectedExam ?? ""}
        onChange={handleExamChange}
        required
      >
        <option value="" disabled>
          Select Exam
        </option>
        {exams.map((exam) => (
          <option key={exam.serial} value={exam.serial}>
            {exam.exam_name} - {exam.exam_type} ({exam.exam_year})
          </option>
        ))}
      </select>

      {/* Class Selection */}
      <select
        className="w-full p-3 border border-gray-300 rounded mb-3"
        value={selectedClass ?? ""}
        onChange={handleClassChange}
        required
      >
        <option value="" disabled>
          Select Class
        </option>
        {classes.map((cls) => (
          <option key={cls.serial} value={cls.serial}>
            {cls.class_name} - Grade {cls.class_grade}
          </option>
        ))}
      </select>

      {/* Subject Selection */}
      <select
        className="w-full p-3 border border-gray-300 rounded mb-3"
        value={selectedSubject ?? ""}
        onChange={handleSubjectChange}
        required
      >
        <option value="" disabled>
          Select Subject
        </option>
        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.subject_name}
          </option>
        ))}
      </select>

      {/* Exam Mark Input */}
      <input
        type="number"
        className="w-full p-3 border border-gray-300 rounded mb-3"
        placeholder="Exam Mark"
        value={examMark ?? ""}
        onChange={handleExamMarkChange}
        required
      />

      {/* Pass Percentage Input */}
      <input
        type="number"
        className="w-full p-3 border border-gray-300 rounded mb-3"
        placeholder="Pass Percentage"
        value={passPercentage ?? ""}
        onChange={handlePassPercentageChange}
        required
      />

      {/* Assign Button */}
      <button
        onClick={handleAssignExam}
        className="w-full bg-blue-700 text-white p-3 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : "Assign Exam"}
      </button>
    </div>
  );
}