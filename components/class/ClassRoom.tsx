"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Heading from "@/components/Heading";
import { Class } from "@/types/class";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import ProgressBar from "@/components/progress"
import Modal from "@/components/Modal";
import AddClassPage from "@/components/class/AddClass";



export default function ClassRoom() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [classStudentCount, setClassStudentCount] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [loadingLink, setLoadingLink] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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
      .order("class_grade", { ascending: false });

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
  return (
    <div className="p-6 w-full max-auto mx-auto h-auto">
      {modal === "category" && <Modal isOpen onClose={() => setModal(null)}><AddClassPage onClassAdded={handleClassAdded} /></Modal>}

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
        <button
          // onClick={() => {
          //   setLoadingLink("/class/add");
          //   router.push("/class/add");
          // }}
          onClick={() => setModal("category")}
          disabled={loadingLink !== null}
          className={`flex items-center gap-2 bg-white text-gray-600 hover:bg-blue-200 hover:text-blue-900 px-4 py-2 rounded ${
            loadingLink === "/class/add" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/class/add" ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
          Add Class
        </button>
      </div>
      <div className="flex justify-between items-center mb-4">
        
      </div>
      <div className=" flex flex-row flex-wrap gap-6">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : currentClasses.length === 0 ? (
          <p className="text-center text-gray-500">No class found.</p>
        ) : (
          currentClasses.map((classItem) => (
            <div
              key={classItem.serial}
              className="border  border-gray-300 p-4 py-6 min-w-[320px] rounded-lg
               flex flex-row flex-wrap items-start gap-2"
            >
              <div className="flex flex-row flex-wrap items-start gap-4">
                <h2 className="text-lg font-light">{classItem.class_grade}</h2>
                <p className="text-xl text-black font-bold ">{classItem.class_name}</p>
              </div>
               {/* <span className="text-l text-blue-600">{classStudentCount[classItem.serial] ?? 0} </span> */}
               <ProgressBar
                  current={classStudentCount[classItem.serial] ?? 0}
                  total={classItem.class_size}
                />
                {/* <span className="text-l text-orange-500"> {classItem.class_size}</span> */}
                <button
                  onClick={() => {
                    setLoadingLink(`/class/edit/${classItem.serial}`);
                    router.push(`/class/edit/${classItem.serial}`);
                  }}
                  disabled={loadingLink !== null}
                  className={`flex items-center justify-center gap-2 bg-green-200 text-green-800 px-3 py-1 rounded hover:bg-green-700 hover:text-white ${
                    loadingLink === `/class/edit/${classItem.serial}` ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loadingLink === `/class/edit/${classItem.serial}` ? <Loader2 className="animate-spin" size={20} /> : "Manage"}
                </button>
                              
            </div>
          ))
        )}
      </div>
      <p className="py-12">&nbsp;</p>
    </div>
  );
}
