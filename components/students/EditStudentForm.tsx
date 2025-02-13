"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Student, Parents } from "@/types/student";
import Heading from "@/components/Heading";
import { ArrowLeft, Plus, Upload, ChevronDown, ChevronUp } from "lucide-react";
import countries from "world-countries";
import { useRouter } from "next/navigation";


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
    id: 0, // Matches student ID
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

};

export default function EditStudentForm({ id }: EditStudentFormProps) {

    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [found, setFound] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [student, setStudent] = useState<Student>(initialStudentState);
    const [parents, setParents] = useState<Parents>(initialParentsState);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const toggleSection = (section: string) => {
      setExpandedSection(expandedSection === section ? null : section);
    };
    useEffect(() => {
      if (message) {
        const timer = setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
        return () => clearTimeout(timer);
      }
    }, [message]);
  
    useEffect(() => {
      const fetchStudentData = async () => {
        try {
          const studentId = Number(id);
  
          // Check if the student exists
          const { data: studentExists, error: studentCheckError } = await supabase
            .from("students")
            .select("*")
            .eq("id", studentId)
            .single();
  
          if (studentCheckError || !studentExists) {
            setMessage("Student with specified ID not found.");
            setLoading(false);
            setFound(false);
            return;
          }
  
          const fetchTableData = async (table: string) => {
            const { data, error } = await supabase.from(table).select("*").eq("id", studentId).single();
            if (error) throw error;
            return data;
          };
  
          const [stuData, parData] = await Promise.all([
            fetchTableData("students"),
            fetchTableData("parents"),
          ]);
  
          setStudent(stuData);
          setParents(parData);
        } catch (error) {
          console.error("Error fetching student data:", error);
          setMessage("Failed to fetch student info data.");
        } finally {
          setLoading(false);
        }
      };
  
      fetchStudentData();
    }, [id]);
  
    // Rest of the component remains the same...
    
    const handleActivation = async (id: number) => {
        if (!confirm("Are you sure you want to change the enrollment status?")) return;
      
        try {
          // Fetch the current enrollment_status
          const { data, error: fetchError } = await supabase
            .from("students")
            .select("enrollment_status")
            .eq("id", id)
            .single();
      
          if (fetchError) throw fetchError;
          // Toggle the boolean value (true → false, false → true)
          const newStatus = !data.enrollment_status;
          console.log('id:',newStatus)

          // Update the enrollment_status in the database
          const { error: updateError } = await supabase
            .from("students")
            .update({ enrollment_status: newStatus })
            .eq("id", id);
      
          if (updateError) throw updateError;
      
          setMessage("Student status changed successfully!");
          setStudent({ ...student, enrollment_status:newStatus  });
        } catch (error) {
          console.error("Error changing status:", error);
          setMessage("Failed to change student status.");
        }
      };
      
  const handleDeleteStudent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
  
    try {
      const { error: parentError } = await supabase.from("parents").delete().eq("id", id);
      if (parentError) throw parentError;
  
      const { error: studentError } = await supabase.from("students").delete().eq("id", id);
      if (studentError) throw studentError;
        setMessage("student deleted");
      // Redirect to students page after successful deletion
      router.push("/students");
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };
  const handleUpdate = async () => {
    setUpdateLoading(true);
    if (!student || !parents) return;


    // Handle File Upload
    

    try {
      const updateTable = async (table: string, data: any) => {
        const { error } = await supabase.from(table).update(data).eq("id", id);
        if (error) throw error;
      };

      await Promise.all([
        updateTable("students", {
          first_name: student.first_name,
          middle_name: student.middle_name,
          last_name: student.last_name,
          birth_date: student.birth_date,
          gender: student.gender,
          enrollment_status: student.enrollment_status,
        }),
        updateTable("parents", {
            parent_one_first_name: parents.parent_one_first_name,
            parent_one_last_name: parents.parent_one_last_name,
            parent_two_first_name: parents.parent_two_first_name,
            parent_two_last_name: parents.parent_two_last_name,
            parent_one_status: parents.parent_one_status,
            parent_two_status: parents.parent_two_status,
            parent_one_nationality: parents.parent_one_nationality,
            parent_two_nationality: parents.parent_two_nationality,
            parent_one_residency_status: parents.parent_one_residency_status,
            parent_two_residency_status: parents.parent_two_residency_status,
            address: parents.address,
            address_country: parents.address_country,
            phone_number1: parents.phone_number1,
            phone_number2: parents.phone_number2,

        }),
      ]);

      setMessage("Student details updated successfully!");
      setUpdateLoading(false);
    } catch (error) {
      console.error("Error updating student data:", error);
      setMessage("Failed to update student details.");
      setUpdateLoading(false);

    }
  };

  if (loading) return <p>Loading...</p>;
  return (
     !found? 
     <p className="text-l text-center py-20 text-gray-500">Student with specified ID not found.<br/> click on dashboard icon</p>
    : 
     <div className="p-6 max-w-[90%] mx-auto py-5 h-screen">
      <div className="flex justify-between items-center mb-4">
      <Link href="/students" className="bg-white flex items-center text-gray-500 px-4 py-2 rounded hover:bg-red-300 hover:text-red-900">
      <ArrowLeft size={20} /> &nbsp; back to Students
        </Link>
      </div>
      <div className="flex justify-between items-center mb-4">
        <Heading>Edit Student</Heading>
      </div>
      
      <p className="text-green-600 text-xl font-normal mb-4"> {message && <span>{message}</span>}</p>

      {/* Update Button at the Top */}
      <button onClick={handleUpdate} className="w-fit bg-green-200 text-green-800 px-4 py-2 rounded hover:bg-green-600 hover:text-white mt-4">
      {!updateLoading? 'Update Student': 'updating..'}
      </button>

      <div className="flex flex-col gap-6 justify-center md:justify-between max-w-[700px]">
        {/* Basic Info */}
        <div className="bg-white w-full shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection("basic")}> 
            <h2 className={`w-fit px-4 py-2 rounded mt-4 transition  ${
    expandedSection === "basic" ?  "text-black " : "text-gray-500"
  }`}>Basic Information</h2>
            {expandedSection === "basic" ? <ChevronUp /> : <ChevronDown />}
          </div>
          {expandedSection === "basic" && (
            <div className="mt-4 border border-gray-300 rounded-lg p-6">
          <label className="block text-green-800 font-medium mb-1">&nbsp;First name</label>
          <input type="text" placeholder="First name" className="w-full p-2 border border-gray-300 rounded mb-2" value={student?.first_name || ""} onChange={(e) => setStudent({ ...student, first_name: e.target.value })} />
          <label className="block text-green-800 font-medium mb-1">&nbsp;Middle name</label>
          <input type="text" placeholder="middle name" className="w-full p-2 border border-gray-300 rounded mb-2" value={student?.middle_name || ""} onChange={(e) => setStudent({ ...student, middle_name: e.target.value })} />
          <label className="block text-green-800 font-medium mb-1">&nbsp;Last name</label>
          <input type="text" placeholder="Last name" className="w-full p-2 border border-gray-300 rounded mb-2" value={student?.last_name || ""} onChange={(e) => setStudent({ ...student, last_name: e.target.value })} />
          <div className="w-full mt-4 mb-4">
  <label className="block text-green-800 font-medium mb-1">&nbsp;Date of Birth</label>
  <div className="relative">
    <input 
      type="date" 
      value={student.birth_date || ""} 
      onChange={(e) => setStudent({ ...student, birth_date: e.target.value })}
      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
    <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none">
      📅
    </span>
  </div>
</div>

{/* {student.birth_date && (<p className="text-yellow-600 text-xl py-10">{student.birth_date}</p>)} */}
        <label className="block text-green-800 font-medium mb-1">&nbsp;Gender</label>

          <select className="w-full p-2 border border-gray-300 rounded mb-2" value={student?.gender || ""} onChange={(e) => setStudent({ ...student, gender: e.target.value })} required>
          <option value="" disabled>Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          </select>
          </div>)}
        </div>

        {/* parent 1 Info */}
        <div className="bg-white w-full shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection("parent1")}> 
            <h2 className={`w-fit px-4 py-2 rounded mt-4 transition  ${
    expandedSection === "parent1" ?  "text-black " : "text-gray-500"
  }`}>Parent 1 information</h2>
            {expandedSection === "parent1" ? <ChevronUp /> : <ChevronDown />}
          </div>
          {expandedSection === "parent1" && (
            <div className="mt-4 border border-gray-300 rounded-lg p-6">
          <label className="block text-green-800 font-medium mb-1">&nbsp;First name</label>
          <input type="text" placeholder="first name" className="w-full p-2 border border-gray-300 rounded mb-2" value={parents?.parent_one_first_name || ""} onChange={(e) => setParents({ ...parents, parent_one_first_name: String(e.target.value) })} />
          <label className="block text-green-800 font-medium mb-1">&nbsp;Last name</label>
          <input type="text" placeholder="last name" className="w-full p-2 border border-gray-300 rounded mb-2" value={parents?.parent_one_last_name || ""} onChange={(e) => setParents({ ...parents, parent_one_last_name: String(e.target.value) })} />
          <label className="block text-green-800 font-medium mb-1">&nbsp;Martial Status</label>
          <select className="w-full p-2 border border-gray-300 rounded mb-2" value={parents?.parent_one_status || ""} onChange={(e) => setParents({ ...parents, parent_one_status: e.target.value })} >
            <option value="" disabled>Martial Status</option>
            <option value="Single" >Single</option>
            <option value="Married" >Married</option>
            <option value="Divorced" >Divorced</option>
          </select>  
          <label className="block text-green-800 font-medium mb-1">&nbsp;Nationality</label>
          <select className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={parents?.parent_one_nationality || ""}
          onChange={(e) => setParents({ ...parents, parent_one_nationality: e.target.value })} >
            <option value="" disabled>Select Nationality</option>
            {countries.map((country) => (
        <option key={country.cca2} value={country.name.common}>
          {country.name.common}
        </option>
      ))}
          </select>
          <label className="block text-green-800 font-medium mb-1">&nbsp;Residential Status</label>
          <select className="w-full p-2 border border-gray-300 rounded mb-2" value={parents?.parent_one_residency_status || ""} onChange={(e) => setParents({ ...parents, parent_one_residency_status: e.target.value })} >
            <option value="" disabled>Residency Status</option>
            <option value="Citizen" >Citizen</option>
            <option value="Resident" >Resident</option>
            <option value="Refugee" >Refugee</option>
          </select>
          </div>)}
        </div>
      {/* parent 2 Info */}
      <div className="bg-white w-full shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection("parent2")}> 
            <h2 className={`w-fit px-4 py-2 rounded mt-4 transition  ${
    expandedSection === "parent2" ?  "text-black " : "text-gray-500"
  }`}>Parent 2 information</h2>
            {expandedSection === "parent2" ? <ChevronUp /> : <ChevronDown />}
          </div>
          {expandedSection === "parent2" && (
            <div className="mt-4 border border-gray-300 rounded-lg p-6">
          <label className="block text-green-800 font-medium mb-1">&nbsp;First name</label>
          <input type="text" placeholder="first name" className="w-full p-2 border border-gray-300 rounded mb-2" value={parents?.parent_two_first_name || ""} onChange={(e) => setParents({ ...parents, parent_two_first_name: String(e.target.value) })} />
          <label className="block text-green-800 font-medium mb-1">&nbsp;Last name </label>
          <input type="text" placeholder="last name" className="w-full p-2 border border-gray-300 rounded mb-2" value={parents?.parent_two_last_name || ""} onChange={(e) => setParents({ ...parents, parent_two_last_name: String(e.target.value) })} />
          <label className="block text-green-800 font-medium mb-1">&nbsp;Martial Status</label>
          <select className="w-full p-2 border border-gray-300 rounded mb-2" value={parents?.parent_two_status || ""} onChange={(e) => setParents({ ...parents, parent_two_status: e.target.value })} >
            <option value="" disabled>Martial Status</option>
            <option value="Single" >Single</option>
            <option value="Married" >Married</option>
            <option value="Divorced" >Divorced</option>
          </select>  
          <label className="block text-green-800 font-medium mb-1">&nbsp;Nationality</label>
          <select className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={parents?.parent_two_nationality || ""}
          onChange={(e) => setParents({ ...parents, parent_two_nationality: e.target.value })} >
            <option value="" disabled>Select Nationality</option>
            {countries.map((country) => (
        <option key={country.cca2} value={country.name.common}>
          {country.name.common}
        </option>
      ))}
          </select>
          <label className="block text-green-800 font-medium mb-1">&nbsp;Residential Status</label>
          <select className="w-full p-2 border border-gray-300 rounded mb-2" value={parents?.parent_two_residency_status || ""} onChange={(e) => setParents({ ...parents, parent_two_residency_status: e.target.value })} >
            <option value="" disabled>Residency Status</option>
            <option value="Citizen" >Citizen</option>
            <option value="Resident" >Resident</option>
            <option value="Refugee" >Refugee</option>
          </select>
          </div>)}
        </div>

        {/* Additional Info */}
        <div className="bg-white w-full shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection("contact")}> 
            <h2 className={`w-fit px-4 py-2 rounded mt-4 transition  ${
    expandedSection === "contact" ?  "text-black " : "text-gray-500"
  }`}>Contact details</h2>
            {expandedSection === "contact" ? <ChevronUp /> : <ChevronDown />}
          </div>
          {expandedSection === "contact" && (
            <div className="mt-4 border border-gray-300 rounded-lg p-6">
          <label className="block text-green-800 font-medium mb-1">&nbsp;Address Line 1</label>
          <textarea placeholder="Address" className="w-full p-2 border h-35 py-3 border-gray-300 rounded mb-2" value={parents?.address || ""} onChange={(e) => setParents({ ...parents, address: e.target.value })} />
          <label className="block text-green-800 font-medium mb-1">&nbsp;Address country</label>
          <select className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={parents?.address_country || ""}
          onChange={(e) => setParents({ ...parents, address_country: e.target.value })} >
            <option value="" disabled></option>
            {countries.map((country) => (
        <option key={country.cca2} value={country.name.common}>
          {country.name.common}
        </option>
      ))}
          </select>
          <label className="block text-green-800 font-medium mb-1">&nbsp;Contact number 1</label>
          <input type="text" placeholder="contact number 1" className="w-full p-2 border border-gray-300 rounded mb-2" value={parents?.phone_number1 || ""} onChange={(e) => setParents({ ...parents, phone_number1: String(e.target.value) })} />
          <label className="block text-green-800 font-medium mb-1">&nbsp;Contact number 2</label>
          <input type="text" placeholder="contact number 2" className="w-full p-2 border border-gray-300 rounded mb-2" value={parents?.phone_number2 || ""} onChange={(e) => setParents({ ...parents, phone_number2: String(e.target.value) })} />
      </div>)}
        </div>
      </div>

      {/* Update Button at the Bottom */}
      <div className="bg-white text-gray-700 gap-2 p-5 flex justify-between border-b border-white">
      <button onClick={handleUpdate} className="w-fit bg-green-200 text-green-800 px-4 py-2 rounded hover:bg-green-600 hover:text-white mt-4">
      {!updateLoading? 'Update Student': 'updating..'}
      </button>
                </div>
      <p className="py-12 text-gray-400">&nbsp;Warning: Deleting a student is permanent and cannot be undone.<br/>
         Consider deactivating the student instead if you may need their records in the future.</p>
      <div className="bg-white text-gray-700 gap-2 p-5 flex justify-between border-b border-white">
      <button
  onClick={() => handleActivation(student.id)}
  className={`w-fit text-white px-4 py-2 rounded mt-4 transition  ${
    student.enrollment_status ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 hover:bg-gray-700"
  }`}
>
  {student.enrollment_status ? "Enrolled" : "Inactive"}
</button>

      <button
                  onClick={() => handleDeleteStudent(student.id)}
                  className="w-fit bg-gray-600 text-white px-4 py-2 rounded hover:bg-red-500 mt-4"
                >
                  Delete student
                </button>
                </div>
                <p className="py-10">&nbsp;</p>
    </div>
    
  );
}
