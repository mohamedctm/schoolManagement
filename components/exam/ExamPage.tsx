"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import Heading from "@/components/Heading";
import Modal from "@/components/Modal";
import AssignExam from "@/components/profile/SetExam";
import { Loader2, ArrowLeft, FileText, Search, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ExamPagee() {
  const { user } = useUser();
  const [modal, setModal] = useState<string | null>(null);
  const [loadingLink, setLoadingLink] = useState<string | null>(null);
  const router = useRouter();
  const [exams, setExams] = useState<any[]>([]);
  const [filteredExams, setFilteredExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ✅ Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("exam_type"); // Default search by exam_type

  // ✅ Fetch exams (All for Admin, only assigned for teachers)
  useEffect(() => {
    if (!user?.id) return;

    const fetchExams = async () => {
      setLoading(true);
      try {
        let myExamQuery = supabase.from("myexam").select("id, exam_id, class_id, subject_id, teacher_id");

        if (user.level !== "admin") {
          myExamQuery = myExamQuery.eq("teacher_id", user.id); // Only fetch assigned exams for non-admins
        }

        const { data: myExams, error: myExamError } = await myExamQuery;
        if (myExamError) throw myExamError;

        if (!myExams || myExams.length === 0) {
          setMessage(user.level === "admin" ? "No exams found." : "No assigned exams.");
          setLoading(false);
          return;
        }

        // ✅ Extract IDs for related queries
        const examIds = myExams.map((e) => e.exam_id);
        const classIds = myExams.map((e) => e.class_id);
        const subjectIds = myExams.map((e) => e.subject_id);

        // ✅ Fetch exam details
        const { data: examData, error: examError } = await supabase
          .from("exam")
          .select("serial, exam_name, exam_type, exam_year, created_at")
          .in("serial", examIds);

        if (examError) throw examError;

        // ✅ Fetch class details
        const { data: classData, error: classError } = await supabase
          .from("classroom")
          .select("serial, class_name, class_grade")
          .in("serial", classIds);

        if (classError) throw classError;

        // ✅ Fetch subject details
        const { data: subjectData, error: subjectError } = await supabase
          .from("subjects")
          .select("id, subject_name")
          .in("id", subjectIds);

        if (subjectError) throw subjectError;

        // ✅ Fetch exam_assignment data to check for null results
        const { data: examAssignments, error: assignmentError } = await supabase
          .from("exam_assignment")
          .select("unique_id, result")
          .in("unique_id", myExams.map((e) => e.id));

        if (assignmentError) throw assignmentError;

        // ✅ Merge Data
        const mergedExams = myExams.map((exam) => {
          const assignmentsForExam = examAssignments.filter((a) => a.unique_id === exam.id);
          const hasNullResult = assignmentsForExam.some((a) => a.result === null);

          return {
            ...exam,
            examDetails: examData.find((e) => e.serial === exam.exam_id),
            classDetails: classData.find((c) => c.serial === exam.class_id),
            subjectDetails: subjectData.find((s) => s.id === exam.subject_id),
            hasNullResult, // Flag to indicate if any result is null
          };
        });

        setExams(mergedExams);
        setFilteredExams(mergedExams); // Default display
      } catch (error) {
        console.error("Error fetching exams:", error);
        setMessage("Error loading exams.");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [user]);

  // ✅ Handle Search Filtering
  useEffect(() => {
    if (!searchQuery) {
      setFilteredExams(exams);
      return;
    }

    const filtered = exams.filter((exam) => {
      const value =
        searchFilter === "exam_year"
          ? String(exam.examDetails?.exam_year)
          : exam.examDetails?.exam_type.toLowerCase();

      return value?.includes(searchQuery.toLowerCase());
    });

    setFilteredExams(filtered);
  }, [searchQuery, searchFilter, exams]);

  const formatGrade = (grade: number) => {
    if (grade === 15) return "KG";
    if (grade === 13) return "Pre-K 1";
    if (grade === 14) return "Pre-K 2";
    return `Grade ${grade}`;
  };

  return (
    <div className="p-4">
      {modal === "setexam" && (
        <Modal isOpen onClose={() => setModal(null)}>
          <AssignExam />
        </Modal>
      )}

      {/* ✅ Back Button */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => {
            setLoadingLink("/dashboard");
            router.push("/dashboard");
          }}
          disabled={loadingLink !== null}
          className={`flex items-center text-gray-500 px-3 py-2 rounded hover:bg-red-300 hover:text-red-900 transition ${
            loadingLink === "/dashboard" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/dashboard" ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <ArrowLeft size={20} />
          )}
          &nbsp;Dashboard
        </button>
      </div>

      {/* ✅ Page Heading & Set Exam Button */}
      <div className="flex flex-row gap-3 sm:flex-row sm:items-left sm:justify-left sm:gap-8">
        <Heading>Exams</Heading>
        <div className="relative group">
          <button
            onClick={() => setModal("setexam")}
            className="flex items-center justify-center gap-2 bg-blue-200 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-600 hover:text-blue-200 transition"
          >
            Set Exam
          </button>
        </div>
      </div>

      {/* ✅ Search Section */}
      <div className="flex flex-col sm:flex-row gap-3 items-center my-4">
        <div className="flex items-center w-[98%] max-w-fit bg-white border border-gray-300 rounded-lg px-3 py-2">
          <Search size={20} className="text-gray-500" />
          <input
            type="text"
            placeholder={`Search by ${searchFilter.replace("_", " ")}`}
            className="w-2/3 outline-none px-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2.5 w-fit border border-gray-300 rounded"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
        >
          <option value="exam_type">Exam Type</option>
          <option value="exam_year">Exam Year</option>
        </select>
      </div>

      {/* ✅ Exam List Section */}
      <div className="w-full p-4 flex flex-wrap gap-4 justify-start">
        {loading ? (
          <p className="text-center text-gray-500">Loading exams...</p>
        ) : filteredExams.length === 0 ? (
          <p className="text-center text-gray-500">{message || "No results found."}</p>
        ) : (
          filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white shadow-md rounded-lg p-4 w-full sm:w-[90%] md:w-[48%] lg:w-[30%] border border-gray-300"
            >
              <div className="flex items-center gap-5 mb-3">
              <div className="relative group">
                <button
                  onClick={() => {
                    setLoadingLink(`/exam/result/${exam.id}`);
                    router.push(`/exam/result/${exam.id}`);
                  }}
                  disabled={loadingLink !== null}
                  className={`flex items-center font-light gap-2 px-3 py-2 rounded border border-gray-300
                     bg-white text-gray-500 hover:bg-blue-500 hover:text-white ${
                    loadingLink === `/exam/result/${exam.id}` ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loadingLink === `/exam/result/${exam.id}` ? <Loader2 className="animate-spin" size={20} /> : <Eye size={20} />}
                </button>
                <span className="absolute left-1/2 bottom-full mb-2 w-max -translate-x-1/2 bg-yellow-400 text-orange-900 text-s rounded-lg px-3 p-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  Results
                </span>
              </div>
                {/* <FileText size={24} className="text-orange-500" /> */}
                <h3 className="text-lg font">{exam.examDetails?.exam_name}</h3>
              </div>
              <p className="text-l p-2"> {exam.examDetails?.exam_type}</p>
              <p className="text-l p-2"> {exam.examDetails?.exam_year}</p>
              <p className="text-l p-2"> {exam.classDetails?.class_name} ( {formatGrade(exam.classDetails?.class_grade)})</p>
              <p className="text-l p-2"> {exam.subjectDetails?.subject_name}</p>

              {/* ✅ Display message if any result is null */}
              <p className="text-red-500 text-sm mt-2">
                {exam.hasNullResult && (
                <>Results are not completed for some students.</>
              )}
              </p>

              
            </div>
          ))
        )}
      </div>
    </div>
  );
}