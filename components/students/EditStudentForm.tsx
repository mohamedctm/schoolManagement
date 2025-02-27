"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Student, Parents, Medical } from "@/types/student";
import Heading from "@/components/Heading";
import { ArrowLeft, Loader2, ChevronDown, ChevronUp } from "lucide-react";
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

const initialMedicalState: Medical = {
    id: 0,
    has_health_issues: false,
    has_chronic_diseases: false,
    chronic_diseases: "",
    has_allergies: false,
    allergies: "",
    medication: ""
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
  emergency_fname: "",
  emergency_lname: "",
  emergency_number: "",
  relation: "",
};

export default function EditStudentForm({ id }: EditStudentFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [found, setFound] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [student, setStudent] = useState<Student>(initialStudentState);
  const [parents, setParents] = useState<Parents>(initialParentsState);
  const [medical, setMedical] = useState<Medical>(initialMedicalState);
  const [loadingLink, setLoadingLink] = useState<string | null>(null);
  const [expandedSection1, setExpandedSection1] = useState<string | null>(""); // Set "basic" as default expanded section
  const [expandedSection2, setExpandedSection2] = useState<string | null>(""); // Set "basic" as default expanded section
  const [expandedSection3, setExpandedSection3] = useState<string | null>(""); // Set "basic" as default expanded section
  const [expandedSection4, setExpandedSection4] = useState<string | null>(""); // Set "basic" as default expanded section
  const [expandedSection5, setExpandedSection5] = useState<string | null>(""); // Set "basic" as default expanded section

  const toggleSection1 = (section: string) => {
    setExpandedSection1(expandedSection1 === section ? null : section);
  };
  const toggleSection2 = (section: string) => {
    setExpandedSection2(expandedSection2 === section ? null : section);
  };
  const toggleSection3 = (section: string) => {
    setExpandedSection3(expandedSection3 === section ? null : section);
  };
  const toggleSection4 = (section: string) => {
    setExpandedSection4(expandedSection4 === section ? null : section);
  };
    const toggleSection5 = (section: string) => {
    setExpandedSection5(expandedSection5 === section ? null : section);
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

        const [stuData, parData,medData] = await Promise.all([
          fetchTableData("students"),
          fetchTableData("parents"),
          fetchTableData("medical"),
        ]);

        setStudent(stuData);
        setParents(parData);
        setMedical(medData);
      } catch (error) {
        console.log("Error fetching student data:", error);
        setMessage("Failed to fetch student info data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

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
      console.log('id:', newStatus);

      // Update the enrollment_status in the database
      const { error: updateError } = await supabase
        .from("students")
        .update({ enrollment_status: newStatus })
        .eq("id", id);

      if (updateError) throw updateError;

      setMessage("Student status changed successfully!");
      setStudent({ ...student, enrollment_status: newStatus });
    } catch (error) {
      console.log("Error changing status:", error);
      setMessage("Failed to change student status.");
    }
  };
// counting null 
function countNullValues(record: Record<string, any>) {
    return Object.values(record).filter((value) => value === null || value === "").length;
  }
  
  const CHRONIC_DISEASES_LIST = [
    "Asthma",
    "Diabetes",
    "Hypertension",
    "Heart Disease",
    "Epilepsy",
    "Chronic Kidney Disease",
    "Chronic Liver Disease",
    "Chronic Obstructive Pulmonary Disease (COPD)",
    "Sickle Cell Disease",
    "Arthritis",
    "Cancer",
    "HIV/AIDS",
    "Cystic Fibrosis",
    "Multiple Sclerosis",
    "Lupus",
  ];
  //mother
  const fatherRecord = {

  parent_one_first_name: parents.parent_one_first_name,
  parent_one_last_name: parents.parent_one_last_name,
  parent_one_status: parents.parent_one_status,
  parent_one_nationality: parents.parent_one_nationality,
  parent_one_residency_status: parents.parent_one_residency_status,
  phone_number1: parents.phone_number1,
  }
  const motherRecord = {
    parent_two_first_name: parents.parent_two_first_name,
    parent_two_last_name: parents.parent_two_last_name,
    parent_two_status: parents.parent_two_status,
    parent_two_nationality: parents.parent_two_nationality,
    parent_two_residency_status: parents.parent_two_residency_status,
    phone_number2: parents.phone_number2,
    }
    const additional = {
        address: parents.address,
        address_country: parents.address_country,
        emergency_fname: parents.emergency_fname,
        emergency_lname: parents.emergency_lname,
        emergency_number: parents.emergency_number,
        relation: parents.relation,
        }
// 
  const handleDeleteStudent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      const { error: parentError } = await supabase.from("parents").delete().eq("id", id);
      if (parentError) throw parentError;
        const { error: medicalError } = await supabase.from("medical").delete().eq("id", id);
      if (medicalError) throw medicalError;

      const { error: studentError } = await supabase.from("students").delete().eq("id", id);
      if (studentError) throw studentError;
      setMessage("student deleted");
      // Redirect to students page after successful deletion
      router.push("/students");
    } catch (error) {
      console.log("Error deleting student:", error);
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
          emergency_fname: parents.emergency_fname,
        emergency_lname: parents.emergency_lname,
        emergency_number: parents.emergency_number,
        relation: parents.relation,

        }),
        updateTable("medical", {
            has_health_issues: medical.has_health_issues,
            has_chronic_diseases: medical.has_chronic_diseases,
            chronic_diseases: medical.chronic_diseases,
            has_allergies: medical.has_allergies,
            allergies: medical.allergies,
            medication: medical.medication,
          }),
      ]);

      setMessage("Student details updated successfully!");
      setUpdateLoading(false);
    } catch (error) {
      console.log("Error updating student data:", error);
      setMessage("Failed to update student details.");
      setUpdateLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  return !found ? (
    <p className="text-l text-center py-20 text-gray-500">
      Student with specified ID not found.<br /> Click on the dashboard icon.
    </p>
  ) : (
    <div className="p-4 max-w-[90%] mx-auto min-h-screen overflow-y-auto">
      {/* Back Button */}
      <div className="flex justify-between items-center mb-6">
      <button
          onClick={() => {
            setLoadingLink("/students");
            router.push("/students");
          }}
          disabled={loadingLink !== null}
          className={`flex items-center text-gray-500 px-3 py-2 rounded hover:bg-red-300 hover:text-red-900 transition ${
            loadingLink === "/dashboard" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingLink === "/students" ? <Loader2 className="animate-spin" size={20} /> : <ArrowLeft size={20} />}
          &nbsp;back to students
        </button>
      </div>
  
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Student</h1>
      </div>
  
      {/* Message Display */}
      {message && (
        <p className="text-green-600 text-lg font-medium mb-6">{message}</p>
      )}
  
      {/* Update Button at the Top */}
      <button onClick={handleUpdate} className="w-full sm:w-fit bg-green-700 text-green-100 px-6 py-3 rounded-lg hover:bg-green-600 transition duration-300 mb-6">
        {!updateLoading ? 'Update Student' : 'Updating...'}
      </button>
  
      {/* Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Information Section */}
        <div className="bg-white shadow-lg border border-gray-300 rounded-lg p-6">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection1("basic")}>
            <h2 className={`text-lg font-medium ${expandedSection1 === "basic" ? 'text-green-800' : 'text-gray-500'}`}>
              Basic Information <span className={`ml-2 ${countNullValues(student) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {countNullValues(student) > 0 ? 'Incomplete' : 'Complete'}
              </span>
            </h2>
            {expandedSection1 === "basic" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          {expandedSection1 === "basic" && (
            <div className="mt-4 space-y-4">
              <label className="block text-gray-700 font-medium">First Name</label>
              <input type="text" placeholder="First name" className="w-full p-3 border border-gray-300 rounded-lg" value={student?.first_name || ""} onChange={(e) => setStudent({ ...student, first_name: e.target.value })} />
              <label className="block text-gray-700 font-medium">Middle Name</label>
              <input type="text" placeholder="Middle name" className="w-full p-3 border border-gray-300 rounded-lg" value={student?.middle_name || ""} onChange={(e) => setStudent({ ...student, middle_name: e.target.value })} />
              <label className="block text-gray-700 font-medium">Last Name</label>
              <input type="text" placeholder="Last name" className="w-full p-3 border border-gray-300 rounded-lg" value={student?.last_name || ""} onChange={(e) => setStudent({ ...student, last_name: e.target.value })} />
              <label className="block text-gray-700 font-medium">Date of Birth</label>
              <input type="date" className="w-full p-3 border border-gray-300 rounded-lg" value={student.birth_date || ""} onChange={(e) => setStudent({ ...student, birth_date: e.target.value })} />
              <label className="block text-gray-700 font-medium">Gender</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg" value={student?.gender || ""} onChange={(e) => setStudent({ ...student, gender: e.target.value })} required>
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          )}
        </div>
  
        {/* Parent 1 Information Section */}
        <div className="bg-white shadow-lg border border-gray-300 rounded-lg p-6">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection2("parent1")}>
            <h2 className={`text-lg font-medium ${expandedSection2 === "parent1" ? 'text-green-800' : 'text-gray-500'}`}>
              Parent 1 Information <span className={`ml-2 ${countNullValues(fatherRecord) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {countNullValues(fatherRecord) > 0 ? 'Incomplete' : 'Complete'}
              </span>
            </h2>
            {expandedSection2 === "parent1" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          {expandedSection2 === "parent1" && (
            <div className="mt-4 space-y-4">
              <label className="block text-gray-700 font-medium">First Name</label>
              <input type="text" placeholder="First name" className="w-full p-3 border border-gray-300 rounded-lg" value={parents?.parent_one_first_name || ""} onChange={(e) => setParents({ ...parents, parent_one_first_name: e.target.value })} />
              <label className="block text-gray-700 font-medium">Last Name</label>
              <input type="text" placeholder="Last name" className="w-full p-3 border border-gray-300 rounded-lg" value={parents?.parent_one_last_name || ""} onChange={(e) => setParents({ ...parents, parent_one_last_name: e.target.value })} />
              <label className="block text-gray-700 font-medium">Martial Status</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg" value={parents?.parent_one_status || ""} onChange={(e) => setParents({ ...parents, parent_one_status: e.target.value })}>
                <option value="" disabled>Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
              </select>
              <label className="block text-gray-700 font-medium">Phone Number</label>
              <input type="text" placeholder="Phone number" className="w-full p-3 border border-gray-300 rounded-lg" value={parents?.phone_number1 || ""} onChange={(e) => setParents({ ...parents, phone_number1: e.target.value })} />
              <label className="block text-gray-700 font-medium">Nationality</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg" value={parents?.parent_one_nationality || ""} onChange={(e) => setParents({ ...parents, parent_one_nationality: e.target.value })}>
                <option value="" disabled>Select Nationality</option>
                {countries.map((country) => (
                  <option key={country.cca2} value={country.name.common}>{country.name.common}</option>
                ))}
              </select>
              <label className="block text-gray-700 font-medium">Residency Status</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg" value={parents?.parent_one_residency_status || ""} onChange={(e) => setParents({ ...parents, parent_one_residency_status: e.target.value })}>
                <option value="" disabled>Select Residency Status</option>
                <option value="Citizen">Citizen</option>
                <option value="Resident">Resident</option>
                <option value="Refugee">Refugee</option>
              </select>
            </div>
          )}
        </div>
  
        {/* Parent 2 Information Section */}
        <div className="bg-white shadow-lg border border-gray-300 rounded-lg p-6">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection3("parent2")}>
            <h2 className={`text-lg font-medium ${expandedSection3 === "parent2" ? 'text-green-800' : 'text-gray-500'}`}>
              Parent 2 Information <span className={`ml-2 ${countNullValues(motherRecord) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {countNullValues(motherRecord) > 0 ? 'Incomplete' : 'Complete'}
              </span>
            </h2>
            {expandedSection3 === "parent2" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          {expandedSection3 === "parent2" && (
            <div className="mt-4 space-y-4">
              <label className="block text-gray-700 font-medium">First Name</label>
              <input type="text" placeholder="First name" className="w-full p-3 border border-gray-300 rounded-lg" value={parents?.parent_two_first_name || ""} onChange={(e) => setParents({ ...parents, parent_two_first_name: e.target.value })} />
              <label className="block text-gray-700 font-medium">Last Name</label>
              <input type="text" placeholder="Last name" className="w-full p-3 border border-gray-300 rounded-lg" value={parents?.parent_two_last_name || ""} onChange={(e) => setParents({ ...parents, parent_two_last_name: e.target.value })} />
              <label className="block text-gray-700 font-medium">Martial Status</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg" value={parents?.parent_two_status || ""} onChange={(e) => setParents({ ...parents, parent_two_status: e.target.value })}>
                <option value="" disabled>Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
              </select>
              <label className="block text-gray-700 font-medium">Phone Number</label>
              <input type="text" placeholder="Phone number" className="w-full p-3 border border-gray-300 rounded-lg" value={parents?.phone_number2 || ""} onChange={(e) => setParents({ ...parents, phone_number2: e.target.value })} />
              <label className="block text-gray-700 font-medium">Nationality</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg" value={parents?.parent_two_nationality || ""} onChange={(e) => setParents({ ...parents, parent_two_nationality: e.target.value })}>
                <option value="" disabled>Select Nationality</option>
                {countries.map((country) => (
                  <option key={country.cca2} value={country.name.common}>{country.name.common}</option>
                ))}
              </select>
              <label className="block text-gray-700 font-medium">Residency Status</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg" value={parents?.parent_two_residency_status || ""} onChange={(e) => setParents({ ...parents, parent_two_residency_status: e.target.value })}>
                <option value="" disabled>Select Residency Status</option>
                <option value="Citizen">Citizen</option>
                <option value="Resident">Resident</option>
                <option value="Refugee">Refugee</option>
              </select>
            </div>
          )}
        </div>
  
        {/* Additional Information Section */}
        <div className="bg-white shadow-lg border border-gray-300 rounded-lg p-6">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection4("additional")}>
            <h2 className={`text-lg font-medium ${expandedSection4 === "additional" ? 'text-green-800' : 'text-gray-500'}`}>
              Additional Information <span className={`ml-2 ${countNullValues(additional) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {countNullValues(additional) > 0 ? 'Incomplete' : 'Complete'}
              </span>
            </h2>
            {expandedSection4 === "additional" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          {expandedSection4 === "additional" && (
            <div className="mt-4 space-y-4">
              <label className="block text-gray-700 font-medium">Address</label>
              <textarea placeholder="Address" className="w-full p-3 border border-gray-300 rounded-lg" value={parents?.address || ""} onChange={(e) => setParents({ ...parents, address: e.target.value })} />
              <label className="block text-gray-700 font-medium">Address Country</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg" value={parents?.address_country || ""} onChange={(e) => setParents({ ...parents, address_country: e.target.value })}>
                <option value="" disabled>Select Country</option>
                {countries.map((country) => (
                  <option key={country.cca2} value={country.name.common}>{country.name.common}</option>
                ))}
              </select>
              <h2 className="text-lg font-medium text-gray-700">Emergency Contact</h2>
              <label className="block text-gray-700 font-medium">First Name</label>
              <input type="text" placeholder="First name" className="w-full p-3 border border-gray-300 rounded-lg" value={parents?.emergency_fname || ""} onChange={(e) => setParents({ ...parents, emergency_fname: e.target.value })} />
              <label className="block text-gray-700 font-medium">Last Name</label>
              <input type="text" placeholder="Last name" className="w-full p-3 border border-gray-300 rounded-lg" value={parents?.emergency_lname || ""} onChange={(e) => setParents({ ...parents, emergency_lname: e.target.value })} />
              <label className="block text-gray-700 font-medium">Relation to Student</label>
              <input type="text" placeholder="Relation" className="w-full p-3 border border-gray-300 rounded-lg" value={parents?.relation || ""} onChange={(e) => setParents({ ...parents, relation: e.target.value })} />
              <label className="block text-gray-700 font-medium">Emergency Contact Number</label>
              <input type="text" placeholder="Emergency contact number" className="w-full p-3 border border-gray-300 rounded-lg" value={parents?.emergency_number || ""} onChange={(e) => setParents({ ...parents, emergency_number: e.target.value })} />
            </div>
          )}
        </div>
  
        {/* Medical Information Section */}
        <div className="bg-white shadow-lg border border-gray-300 rounded-lg p-6">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection5("medical")}>
            <h2 className={`text-lg font-medium ${expandedSection5 === "medical" ? 'text-green-800' : 'text-gray-500'}`}>
              Health Information <span className={`ml-2 ${countNullValues(medical) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {countNullValues(medical) > 0 ? 'Incomplete' : 'Complete'}
              </span>
            </h2>
            {expandedSection5 === "medical" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          {expandedSection5 === "medical" && (
            <div className="mt-4 space-y-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={medical.has_health_issues} onChange={(e) => setMedical({ ...medical, has_health_issues: e.target.checked })} className="h-5 w-5" />
                Has Health Issues
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={medical.has_chronic_diseases} onChange={(e) => setMedical({ ...medical, has_chronic_diseases: e.target.checked })} className="h-5 w-5" />
                Has Chronic Diseases
              </label>
              {medical.has_chronic_diseases && (
                <select className="w-full p-3 border border-gray-300 rounded-lg" value={medical?.chronic_diseases || ""} onChange={(e) => setMedical({ ...medical, chronic_diseases: e.target.value })}>
                  <option value="" disabled>Select Chronic Disease</option>
                  {CHRONIC_DISEASES_LIST.map((disease) => (
                    <option key={disease} value={disease}>{disease}</option>
                  ))}
                </select>
              )}
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={medical.has_allergies} onChange={(e) => setMedical({ ...medical, has_allergies: e.target.checked })} className="h-5 w-5" />
                Has Allergies
              </label>
              {medical.has_allergies && (
                <textarea placeholder="List allergies" className="w-full p-3 border border-gray-300 rounded-lg" value={medical?.allergies || ""} onChange={(e) => setMedical({ ...medical, allergies: e.target.value })} />
              )}
              <label className="block text-gray-700 font-medium">Medication</label>
              <textarea placeholder="List any medications" className="w-full p-3 border border-gray-300 rounded-lg" value={medical?.medication || ""} onChange={(e) => setMedical({ ...medical, medication: e.target.value })} />
            </div>
          )}
        </div>
      </div>
  <div>
      {/* Update Button at the Bottom */}
      <button onClick={handleUpdate} className="w-full sm:w-fit bg-green-700 text-green-200 px-6 py-3 rounded-lg hover:bg-green-600 transition duration-300 mt-6">
        {!updateLoading ? 'Update Student': 'updating..'}
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
