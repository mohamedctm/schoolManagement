"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Heading from "@/components/Heading";
import { Class } from "@/types/class";
import { ArrowLeft, Plus,Settings, Loader2 } from "lucide-react";
import ProgressBar from "@/components/progress"
import Modal from "@/components/Modal";
import AddClassPage from "@/components/class/AddClass";
import AddSubjectPage from "@/components/class/AddSubject";
import AlterClassPage from "@/components/class/AlterClass";



export default function ClassRoom() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [classStudentCount, setClassStudentCount] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [loadingLink, setLoadingLink] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClassId, setSelectedClassId] = useState(1);
  const classesPerPage = 20;
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth", { credentials: "include" });

        if (!response.ok) {
          if (isMounted) {
            router.push("/login");
          }
          return;
        }

        if (isMounted) {
          fetchClasses();
        }
      } catch (error) {
        console.log("Auth check failed:", error);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const fetchClasses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("classroom")
      .select("*")
      .order("class_grade", { ascending: true });

    if (error) {
      console.log("Error fetching classes:", error);
    } else {
      setClasses(data);
      setFilteredClasses(data);
      fetchStudentCounts(data);
    }
    setLoading(false);
  };

  const fetchStudentCounts = async (classList: Class[]) => {
    const counts: { [key: number]: number } = {};
    for (const classItem of classList) {
      const { count, error } = await supabase
        .from("assignment")
        .select("student_id", { count: "exact" })
        .eq("class_id", classItem.serial);

      if (!error) {
        counts[classItem.serial] = count || 0;
      }
    }
    setClassStudentCount(counts);
  };

  useEffect(() => {
    let isMounted = true;

    const subscription = supabase
      .channel("classroom")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "classroom" },
        () => {
          if (isMounted) fetchClasses();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(subscription);
    };
  }, []);

  const indexOfLastClass = currentPage * classesPerPage;
  const indexOfFirstClass = indexOfLastClass - classesPerPage;
  const currentClasses = filteredClasses.slice(indexOfFirstClass, indexOfLastClass);
  const [modal, setModal] = useState<string | null>(null);
  const handleClassAdded = () => {
    fetchClasses(); // Refresh the list when a class is added
  };
  const groupedClasses = currentClasses.reduce((acc, classItem) => {
    if (!acc[classItem.class_grade]) {
      acc[classItem.class_grade] = [];
    }
    acc[classItem.class_grade].push(classItem);
    return acc;
  }, {} as Record<string, Class[]>);
  const formatGrade = (grade: number) => {
    if (grade === 15) return "KG";
    if (grade === 13) return "Pre-K 1";
    if (grade === 14) return "Pre-K 2";
    return `Grade ${grade}`;
  };
  return (
    <div className="p-6 max-w-[95%] mx-auto my-2 h-auto">
      {modal === "addclass" && <Modal isOpen onClose={() => setModal(null)}><AddClassPage onClassAdded={handleClassAdded} /></Modal>}
      {modal === "addsubject" && <Modal isOpen onClose={() => setModal(null)}><AddSubjectPage onClassAdded={handleClassAdded} /></Modal>}

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => {
            setLoadingLink("/dashboard");
            router.push("/dashboard");
          }}
          disabled={loadingLink !== null}
          className={`flex items-center text-gray-500 px-4 py-2 rounded hover:bg-red-300 hover:text-red-900 ${
            loadingLink === "/dashboard" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/dashboard" ? <Loader2 className="animate-spin" size={20} /> : <ArrowLeft size={20} />}
          &nbsp;Dashboard
        </button>
      </div>

      <div className="flex justify-between max-w-5xl items-center mb-4">
        <Heading>Class Room</Heading>
        
      </div>
      <div className="flex justify-items-end gap-4 max-w-5xl py-10 items-center mb-4">
      <button onClick={() => setModal("addclass")}
          disabled={loadingLink !== null}
          className="flex items-center gap-2 bg-orange-200 text-orange-500 hover:bg-orange-600 hover:text-orange-200 px-4 py-2 rounded"
        >
          Add Class
        </button>
      <button
          onClick={() => setModal("addsubject")}
          disabled={loadingLink !== null}
          className="flex items-center gap-2 bg-orange-200 text-orange-500 hover:bg-orange-600 hover:text-orange-200 px-4 py-2 rounded"
        >
          Add subject
        </button>
        
      </div>
      <div className=" flex flex-row flex-wrap gap-6">
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : Object.keys(groupedClasses).length === 0 ? (
        <p className="text-center text-gray-500">No class found.</p>
      ) : (
        Object.entries(groupedClasses).map(([grade, classList]) => (
          <fieldset key={grade} className="border-2 border-dotted border-b-cyan-700 p-4 rounded-lg">
            <legend className="text-cyan-800 text-lg font-bold">{formatGrade(Number(grade))}</legend>
            <div className="flex flex-row flex-wrap gap-6 p-4 rounded-lg">
              {classList
                .sort((a, b) => a.class_name.localeCompare(b.class_name)) // Sort by class_name (A, B, C)
                .map((classItem) => (
                  <div
                    key={classItem.serial}
                    className="border  border-gray-300 p-4 py-6 min-w-[320px] rounded-lg flex flex-col flex-wrap gap-2"
                  >
                    <div className="flex flex-row gap-6">
                    <p className="text-xl text-black font-bold">{classItem.class_name}</p>

                    <ProgressBar current={classStudentCount[classItem.serial] ?? 0} total={classItem.class_size} />
                    </div>
                  <div className="flex flex-row justify-start gap-0 w-[99%]">
                    <button
                      onClick={() => {
                        setLoadingLink(`/class/edit/${classItem.serial}`);
                        router.push(`/class/edit/${classItem.serial}`);
                      }}
                      disabled={loadingLink !== null}
                      className={`flex items-center font-light text-lg justify-center gap-2 px-3 py-1 rounded border border-gray-300  bg-white text-gray-600  hover:bg-blue-500 hover:text-blue-200 mt-4  ${
                        loadingLink === `/class/edit/${classItem.serial}` ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {loadingLink === `/class/edit/${classItem.serial}` ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> students</>}
                    </button>
                    <button
                      onClick={() => {
                        setLoadingLink(`/class/subject/${classItem.serial}`);
                        router.push(`/class/subject/${classItem.serial}`);
                      }}
                      disabled={loadingLink !== null}
                      className={`flex items-center font-light text-lg justify-center gap-2 px-3 py-1 rounded border border-gray-300  bg-white text-gray-600  hover:bg-blue-500 hover:text-blue-200 mt-4  ${
                        loadingLink === `/class/subject/${classItem.serial}` ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {loadingLink === `/class/subject/${classItem.serial}` ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> subject</>}
                    </button>
                    <button
          onClick={() => {setModal("alterclass");
            setSelectedClassId(classItem.serial);
          }}
          disabled={loadingLink !== null}
          className="w-[30%] bg-white text-gray-600 px-4 py-2 rounded border border-gray-300  hover:bg-blue-500 hover:text-blue-200 mt-4" >
        <> <Settings size={20}/> </> 
        </button>
        {modal === "alterclass" && selectedClassId !== null && (
  <Modal isOpen onClose={() => setModal(null)}>
    <AlterClassPage 
      classid={selectedClassId} 
      onClassAdded={handleClassAdded} 
      onClose={() => setModal(null)} // ✅ Close modal after delete
    />
  </Modal>
)}

        </div>
                  </div>
                ))}
            </div>
          </fieldset>
        ))
        )}
      </div>
      <p className="py-12">&nbsp;</p>
    </div>
  );
}
