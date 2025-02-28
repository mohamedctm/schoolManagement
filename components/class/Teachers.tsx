import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Class, TeacherAssignment } from "@/types/class";
import { Employee } from "@/types/employee";
import Heading from "@/components/Heading";
import { ArrowLeft,GraduationCap,Loader2 ,Book,Users} from "lucide-react";
import { useRouter } from "next/navigation";

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

export default function Teachers({ id }: EditStudentFormProps) {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [found, setFound] = useState(true);
  const [classes, setClass] = useState<Class>(initialClassState);
  const [teachers, setTeachers] = useState<Employee[]>([]);
  const [assignedTeachers, setAssignedSubjects] = useState<Employee[]>([]);
  const [unassignedSubjects, setUnassignedSubjects] = useState<Employee[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  const [loadingLink, setLoadingLink] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState(false); // New state for "Select All"
  const router = useRouter();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const classId = Number(id);

        // Check if the class exists
        const { data: classExists, error: classCheckError } = await supabase
          .from("classroom")
          .select("*")
          .eq("serial", classId)
          .single();

        if (classCheckError || !classExists) {
          setMessage("Class with specified ID not found.");
          setLoading(false);
          setFound(false);
          return;
        }

        // Fetch class data
        const { data: classData, error: classError } = await supabase
          .from("classroom")
          .select("*")
          .eq("serial", classId)
          .single();
        if (classError) throw classError;
        setClass(classData);

        // Fetch all teachers
        const { data: subjectsData, error: subjectsError } = await supabase
          .from("employees")
          .select("*")
          .order("name", { ascending: true });
        if (subjectsError) throw subjectsError;

        // Fetch all employee assignments
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from("teacher_assignment")
          .select("*");
        if (assignmentsError) throw assignmentsError;

        // Subjects assigned to this specific class
        const assignedSubjectIds = assignmentsData
          .filter((a) => a.class_id === classId) // Filter by the current class ID
          .map((a) => a.teacher_id);
        const assignedSubjectList = subjectsData.filter((s) =>
          assignedSubjectIds.includes(s.id)
        );
        setAssignedSubjects(assignedSubjectList);

        // Subjects not assigned to this specific class
        const unassignedSubjects = subjectsData.filter(
          (s) => !assignedSubjectIds.includes(s.id) // Only exclude teachers assigned to this class
        );
        setUnassignedSubjects(unassignedSubjects);

        setTeachers(subjectsData);
      } catch (error) {
        console.log("Error fetching class data:", error);
        setMessage("Failed to fetch class info data.");
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [id]);

  // Handle individual employee selection
  const handleSubjectSelection = (subjectId: number) => {
    setSelectedTeachers((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  // Handle "Select All" functionality
  const handleSelectAll = () => {
    if (selectAll) {
      // If "Select All" is already active, clear all selections
      setSelectedTeachers([]);
    } else {
      // If "Select All" is inactive, select all unassigned teachers
      const allUnassignedSubjectIds = unassignedSubjects.map((employee) => employee.id);
      setSelectedTeachers(allUnassignedSubjectIds);
    }
    setSelectAll(!selectAll); // Toggle the "Select All" state
  };

  const handleAssignedTeachers = async () => {
    if (selectedTeachers.length === 0) {
      setMessage("No teachers selected.");
      return;
    }

    try {
      for (const subjectId of selectedTeachers) {
        // Check if the employee is already assigned to this class
        const { data: existingAssignment, error: fetchError } = await supabase
          .from("teacher_assignment")
          .select("*")
          .eq("teacher_id", subjectId)
          .eq("class_id", classes.serial)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError; // Ignore "No rows found" error
        }

        if (existingAssignment) {
          setMessage("Teacher already assigned to this class.");
          return;
        } else {
          // Insert a new assignment
          const { error: insertError } = await supabase
            .from("teacher_assignment")
            .insert([
              {
                teacher_id: subjectId,
                class_id: classes.serial,
                created_at: new Date().toISOString(),
              },
            ]);

          if (insertError) throw insertError;
        }
      }

      setMessage("Subjects assigned successfully!");
      setSelectedTeachers([]);
      setSelectAll(false); // Reset "Select All" state

      // Refresh the lists
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("employees")
        .select("*")
        .order("name", { ascending: true });
      if (subjectsError) throw subjectsError;

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("teacher_assignment")
        .select("*");
      if (assignmentsError) throw assignmentsError;

      const assignedSubjectIds = assignmentsData
        .filter((a) => a.class_id === classes.serial)
        .map((a) => a.teacher_id);
      const assignedSubjectList = subjectsData.filter((s) =>
        assignedSubjectIds.includes(s.id)
      );
      setAssignedSubjects(assignedSubjectList);

      const unassignedSubjects = subjectsData.filter(
        (s) => !assignedSubjectIds.includes(s.id)
      );
      setUnassignedSubjects(unassignedSubjects);
    } catch (error) {
      console.log("Error assigning teachers:", error);
      setMessage("Failed to assign teachers.");
    }
  };

  const handleDeleteTeacher = async (subjectId: number) => {
    if (!confirm("Are you sure you want to remove this teacher from the class?"))
      return;

    try {
      const { error } = await supabase
        .from("teacher_assignment")
        .delete()
        .eq("teacher_id", subjectId)
        .eq("class_id", classes.serial);
      if (error) throw error;
      setMessage("Employee removed from class.");

      // Refresh the lists
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("employees")
        .select("*")
        .order("name", { ascending: true });
      if (subjectsError) throw subjectsError;

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("teacher_assignment")
        .select("*");
      if (assignmentsError) throw assignmentsError;

      const assignedSubjectIds = assignmentsData
        .filter((a) => a.class_id === classes.serial)
        .map((a) => a.teacher_id);
      const assignedSubjectList = subjectsData.filter((s) =>
        assignedSubjectIds.includes(s.id)
      );
      setAssignedSubjects(assignedSubjectList);

      const unassignedSubjects = subjectsData.filter(
        (s) => !assignedSubjectIds.includes(s.id)
      );
      setUnassignedSubjects(unassignedSubjects);
    } catch (error) {
      console.log("Error removing Teacher:", error);
      setMessage("Failed to remove Teacher.");
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
    <p className="text-center py-10 text-gray-500 text-sm sm:text-base">
      Class with specified ID not found.
      <br /> Click on the dashboard icon.
    </p>
  ) : (
    <div className="w-full max-w-full mx-auto h-auto overflow-x-hidden">
      {/* Back Button */}
      <div className="flex justify-start gap-4 flex-row flex-wrap items-center mb-4">
      <button
          onClick={() => {
            setLoadingLink("/class");
            router.push("/class");
          }}
          disabled={loadingLink !== null}
          className={`flex items-center text-gray-500 px-4 py-2 rounded hover:bg-red-300 hover:text-red-900 ${
            loadingLink === "/class" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/class" ? <Loader2 className="animate-spin" size={20} /> : <ArrowLeft size={20} />}
          &nbsp;back to classes
        </button>
        <div className="relative group">
                        <button
                          onClick={() => {
                            setLoadingLink(`/class/edit/${id}`);
                            router.push(`/class/edit/${id}`);
                          }}
                          disabled={loadingLink !== null}
                          className={`flex items-center font-light gap-2 px-3 py-2 rounded border border-gray-300 bg-white text-gray-600 hover:bg-blue-500 hover:text-white ${
                            loadingLink === `/class/edit/${id}` ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {loadingLink === `/class/edit/${id}` ? <Loader2 className="animate-spin" size={20} /> : <GraduationCap size={20} />}
                        </button>
                        <span className="absolute left-1/2 bottom-full mb-2 w-max -translate-x-1/2 bg-yellow-400 text-orange-900 text-s rounded-lg px-3 p-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                manage students 
            </span>
                </div>
                        <div className="relative group">
                        <button
                          onClick={() => {
                            setLoadingLink(`/class/subjects/${id}`);
                            router.push(`/class/subjects/${id}`);
                          }}
                          disabled={loadingLink !== null}
                          className={`flex items-center font-light gap-2 px-3 py-2 rounded border border-gray-300 bg-white text-gray-600 hover:bg-blue-500 hover:text-white ${
                            loadingLink === `/class/edit/${id}` ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                         
                        >
                          {loadingLink === `/class/subjects/${id}` ? <Loader2 className="animate-spin" size={20} /> : <Book size={20} />}
                          </button>
                        <span className="absolute left-1/2 bottom-full mb-2 w-max -translate-x-1/2 bg-yellow-400 text-orange-900 text-s rounded-lg px-3 p-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    manage subjects
                </span>
                </div>
                <div className="relative group">
                <button
                          
                          disabled={true}
                          className="flex items-center font-light gap-2 px-3 py-2 rounded border border-gray-300  bg-blue-200 text-blue-600
                             hover:bg-blue-500 hover:text-white"
                         
                        >
                           <Users size={20} />
                          </button>
                        <span className="absolute left-1/2 bottom-full mb-2 w-max -translate-x-1/2 bg-yellow-400 text-orange-900 text-s rounded-lg px-3 p-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    manage Teachers
                </span>
                </div>
      </div>

      {/* Page Heading */}
      <div className="text-left mb-4">
        <Heading>
          <span>
            {formatGrade(Number(classes.class_grade))} {classes.class_name}
          </span>
        </Heading>
      </div>

      {/* Employee Assignment Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Unassigned Subjects */}
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-cyan-700 mb-4 flex flex-row gap-2">
            <Users size={20} />
            <span>Teachers</span>
          </h2>

          {/* Employee List */}
          <div className="border border-gray-300 rounded-lg p-4 sm:p-6">
            <p className="text-green-600 text-sm sm:text-lg font-normal mb-4">
              {message && <span>{message}</span>}
            </p>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="mr-2"
              />
              <span className="text-sm sm:text-base">Select All</span>
            </div>
            <div className="relative h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 bg-white shadow rounded-lg">
              {unassignedSubjects.map((employee) => (
                <div key={employee.id} className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={selectedTeachers.includes(employee.id)}
                    onChange={() => handleSubjectSelection(employee.id)}
                    className="mr-2"
                  />
                  <span className="text-sm sm:text-base">{employee.name} {employee.last_name}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleAssignedTeachers}
              className="w-full max-w-[300px] bg-blue-200 text-blue-800 px-4 py-2 rounded hover:bg-blue-600 hover:text-white mt-4"
            >
              Assign Teachers
            </button>
          </div>
        </div>

        {/* Assigned Subjects */}
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-cyan-700 mb-4 flex flex-row gap-2">
            <Users size={20} />
            <span>Assigned Teachers</span>
          </h2>

          <div className="border border-gray-300 rounded-lg p-4 sm:p-6">
            <div className="relative h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 bg-white shadow rounded-lg">
              {assignedTeachers.map((employee) => (
                <div key={employee.id} className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => handleDeleteTeacher(employee.id)}
                    className=" text-2xl text-gray-500 px-6 py-1 rounded hover:text-red-500"
                  >
                    &times;
                  </button>
                  <span className="text-sm sm:text-base">{employee.name} {employee.last_name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}