"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Employee, Salary, EmployeeInfo } from "@/types/employee";
import Heading from "@/components/Heading";
import { ArrowLeft, Plus, Upload } from "lucide-react";
import countries from "world-countries";

interface EditEmployeeFormProps {
  id: string;
}

const initialSalaryState: Salary = {
  id: 0,
  salary: 0,
  contract_length: 0,
  contract_copy: "",
};

const initialEmployeeState: Employee = {
  id: 0,
  name: "",
  email: "",
  position: "",
  username: "",
  password: "",
  last_name: "",
};

const initialEmployeeInfoState: EmployeeInfo = {
  id: 0,
  address: "",
  phone_number: "",
  marital_status: "",
  residency_status: "",
  nationality: "",
  residency_country: "",
  identification_type: "",
  identification_number: "",
  gender: "",
  birth_date: ""
};

export default function EditEmployeeForm({ id }: EditEmployeeFormProps) {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [salary, setSalary] = useState<Salary>(initialSalaryState);
  const [employee, setEmployee] = useState<Employee>(initialEmployeeState);
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo>(initialEmployeeInfoState);
  const [contractFile, setContractFile] = useState<File | null>(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000); // Clear message after 10 seconds
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const employeeId = Number(id);
        const fetchTableData = async (table: string) => {
          const { data, error } = await supabase.from(table).select("*").eq("id", employeeId).single();
          if (error) throw error;
          return data;
        };

        const [empData, salData, empInfoData] = await Promise.all([
          fetchTableData("employees"),
          fetchTableData("salary"),
          fetchTableData("employee_info"),
        ]);

        setEmployee(empData);
        setSalary(salData);
        setEmployeeInfo(empInfoData);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setMessage("Failed to fetch employee info data.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setContractFile(e.target.files[0]);
  };

  const handleUpdate = async () => {
    setUpdateLoading(true);
    if (!employee || !salary || !employeeInfo) return;

    let contractFileName = salary.contract_copy;

    // Handle File Upload
    if (contractFile) {
      const fileExtension = contractFile.name.split(".").pop();
      if (!["jpg", "png"].includes(fileExtension || "")) {
        setMessage("Only JPG and PNG formats are allowed.");
        return;
      }

      contractFileName = `contract_${id}_${Date.now()}.${fileExtension}`;
      const formData = new FormData();
      formData.append("file", contractFile);
      formData.append("fileName", contractFileName);

      try {
        const response = await fetch("/api/uploadContract", { method: "POST", body: formData });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        setMessage("Contract uploaded successfully!");
      } catch (error) {
        setMessage("Error uploading contract file.");
        return;
      }
    }

    try {
      const updateTable = async (table: string, data: any) => {
        const { error } = await supabase.from(table).update(data).eq("id", id);
        if (error) throw error;
      };

      await Promise.all([
        updateTable("employees", {
          name: employee.name,
          email: employee.email,
          position: employee.position,
          username: employee.username,
          last_name: employee.last_name,
        }),
        updateTable("salary", {
          salary: salary.salary,
          contract_length: salary.contract_length,
          contract_copy: contractFileName,
        }),
        updateTable("employee_info", {
          address: employeeInfo.address,
          phone_number: employeeInfo.phone_number,
          marital_status: employeeInfo.marital_status,
          residency_status: employeeInfo.residency_status,
          nationality: employeeInfo.nationality,
          residency_country: employeeInfo.residency_country,
          identification_type: employeeInfo.identification_type,
          identification_number: employeeInfo.identification_number,
          gender: employeeInfo.gender,
          birth_date: employeeInfo.birth_date
        }),
      ]);

      setMessage("Employee details updated successfully!");
      setUpdateLoading(false);
    } catch (error) {
      console.error("Error updating employee data:", error);
      setMessage("Failed to update employee details.");
      setUpdateLoading(false);

    }
  };

  if (loading) return <p>Loading...</p>;
  return (
    <div className="p-6 max-w-[90%] mx-auto py-5 h-screen">
      <div className="flex justify-between items-center mb-4">
        <Link href="/employees" className="bg-white flex items-center text-gray-500 px-4 py-2 rounded hover:bg-red-600 hover:text-white">
          <ArrowLeft size={20} /> &nbsp; back to Employees
        </Link>
      </div>
      <div className="flex justify-between items-center mb-4">
        <Heading>Edit Employee</Heading>
      </div>
      <div className="flex justify-between items-center mb-4">
        {!employee?.username && (
          <Link href={`/employees/username/${id}`} className="flex items-center gap-2 bg-white text-gray-600 hover:bg-green-600 hover:text-white px-4 py-2 rounded">
            <Plus size={20} /> Create username
          </Link>
        )}
      </div>
      <p className="text-green-600 text-xl font-normal mb-4"> {message && <span>{message}</span>}</p>

      {/* Update Button at the Top */}
      <button onClick={handleUpdate} className="w-fit bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 mt-4">
      {!updateLoading? 'Update Employee': 'updating..'}
      </button>

      <div className="flex flex-wrap gap-6 justify-center md:justify-between">
        {/* Basic Info */}
        <div className="bg-white shadow-lg rounded-lg p-6 w-full md:w-[48%]">
          <h2 className="text-lg text-gray-400 font-medium mb-4">Basic Information</h2>
          <input type="text" placeholder="First name" className="w-full p-2 border border-gray-300 rounded mb-2" value={employee?.name || ""} onChange={(e) => setEmployee({ ...employee, name: e.target.value })} />
          <input type="text" placeholder="Last name" className="w-full p-2 border border-gray-300 rounded mb-2" value={employee?.last_name || ""} onChange={(e) => setEmployee({ ...employee, last_name: e.target.value })} />
          <input type="email" placeholder="Email" className="w-full p-2 border border-gray-300 rounded mb-2" value={employee?.email || ""} onChange={(e) => setEmployee({ ...employee, email: e.target.value })} />
          <select className="w-full p-2 border border-gray-300 rounded mb-2" value={employee?.position || ""} onChange={(e) => setEmployee({ ...employee, position: e.target.value })} required>
          <option value="" disabled>Select Position</option>
          <option value="Director General">Director General</option>
          <option value="school Principal">school Principal</option>
          <option value="Director General">Director General</option>
          <option value="School Secretary General">School Secretary General</option>
          <option value="Academic Coordinator">Academic Coordinator</option>
          <option value="Head Teacher">Head Teacher</option>
          <option value="Assistance Head Teacher">Assistance Head Teacher</option>
          <option value="Deputy Head Teacher">Deputy Head Teacher</option>
          <option value="Head Teacher/ Arabic Seciotn">Head Teacher/ Arabic Seciotn</option>
          <option value="Finance & HR">Finance & HR</option>
          <option value="Head/Secondary">Head/Secondary</option>
          <option value="Head/Primary">Head/Primary</option>
          <option value="Head/Kgs">Head/Kgs</option>
          <option value="School Officer">School Officer</option>
          <option value="School Advisor">School Advisor</option>
          <option value="Accountant">Accountant</option>
          </select>
        </div>

        {/* Salary Info */}
        <div className="bg-white shadow-lg rounded-lg p-6 w-full md:w-[40%]">
          <h2 className="text-lg text-gray-400 font-medium mb-4">Salary Information</h2>
          <input type="number" placeholder="Salary" className="w-full p-2 border border-gray-300 rounded mb-2" value={salary?.salary || ""} onChange={(e) => setSalary({ ...salary, salary: Number(e.target.value) })} />
          <input type="number" placeholder="Contract Length (months)" className="w-full p-2 border border-gray-300 rounded mb-2" value={salary?.contract_length || ""} onChange={(e) => setSalary({ ...salary, contract_length: Number(e.target.value) })} />
          {/* File Upload */}
          <label className="flex items-center gap-2 cursor-pointer text-black bg-gray-300 hover:text-white px-4 py-2 rounded hover:bg-gray-400">
          <Upload size={20} /> Upload Contract
          <input type="file" accept=".jpg,.png" className="hidden" onChange={handleFileChange} />
        </label>
        {contractFile && <p className="text-sm text-gray-500 mt-2">{contractFile.name}</p>}
        {salary.contract_copy && <p className="text-xl text-yellow-600 mt-2"> 1 found!</p>}
              </div>

        {/* Additional Info */}
        <div className="bg-white shadow-lg rounded-lg p-6 w-full md:w-[48%]">
          <h2 className="text-lg text-gray-400 font-medium mb-4">Additional Information</h2>
          {/* date design */}
          <div className="w-full mt-4 mb-4">
  <label className="block text-gray-700 font-medium mb-1">Date of Birth</label>
  <div className="relative">
    <input 
      type="date" 
      value={employeeInfo.birth_date || ""} 
      onChange={(e) => setEmployeeInfo({ ...employeeInfo, birth_date: e.target.value })}
      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
    <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none">
      📅
    </span>
  </div>
</div>

{/* date design */}
        {/* {employeeInfo.birth_date && (<p className="text-yellow-600 text-xl py-10">{employeeInfo.birth_date}</p>)} */}
          <select className="w-full p-2 border border-gray-300 rounded mb-2" value={employeeInfo?.gender || ""} onChange={(e) => setEmployeeInfo({ ...employeeInfo, gender: e.target.value })} >
            <option value="" disabled>Select Gender</option>
            <option value="Male" >Male</option>
            <option value="Female" >Female</option>
          </select>
          <select className="w-full p-2 border border-gray-300 rounded mb-2" value={employeeInfo?.identification_type || ""} onChange={(e) => setEmployeeInfo({ ...employeeInfo, identification_type: e.target.value })} >
            <option value="" disabled>Identification Type </option>
            <option value="ID" >ID</option>
            <option value="Passport" >Passport</option>
            <option value="license" >License</option>
            <option value="other" >other</option>
          </select>         
          <input type="text" placeholder="Identification number " className="w-full p-2 border border-gray-300 rounded mb-2" value={employeeInfo?.identification_number || ""} onChange={(e) => setEmployeeInfo({ ...employeeInfo, identification_number: e.target.value })} />

          <select className="w-full p-2 border border-gray-300 rounded mb-2" value={employeeInfo?.marital_status || ""} onChange={(e) => setEmployeeInfo({ ...employeeInfo, marital_status: e.target.value })} >
            <option value="" disabled>Select Status</option>
            <option value="Single" >Single</option>
            <option value="Married" >Married</option>
            <option value="Divorced" >Divorced</option>
          </select>
          <select className="w-full p-2 border border-gray-300 rounded mb-2" value={employeeInfo?.residency_status || ""} onChange={(e) => setEmployeeInfo({ ...employeeInfo, residency_status: e.target.value })} >
            <option value="" disabled>Residency Status</option>
            <option value="Citizen" >Citizen</option>
            <option value="Resident" >Resident</option>
            <option value="Refugee" >Refugee</option>
          </select>
          <select className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={employeeInfo?.nationality || ""}
          onChange={(e) => setEmployeeInfo({ ...employeeInfo, nationality: e.target.value })} >
            <option value="" disabled>Select Nationality</option>
            {countries.map((country) => (
        <option key={country.cca2} value={country.name.common}>
          {country.name.common}
        </option>
      ))}
          </select>
          <input type="text" placeholder="Phone Number" className="w-full p-2 border border-gray-300 rounded mb-2" value={employeeInfo?.phone_number || ""} onChange={(e) => setEmployeeInfo({ ...employeeInfo, phone_number: e.target.value })} />
          <p className="text-lg text-gray-400 font-medium mb-4">address</p>
          <textarea placeholder="Address" className="w-full p-2 border h-35 py-3 border-gray-300 rounded mb-2" value={employeeInfo?.address || ""} onChange={(e) => setEmployeeInfo({ ...employeeInfo, address: e.target.value })} />
          <select className="w-full p-2 border border-gray-300 rounded mb-2" 
          value={employeeInfo?.residency_country || ""}
          onChange={(e) => setEmployeeInfo({ ...employeeInfo, residency_country: e.target.value })} >
            <option value="" disabled>Country</option>
            {countries.map((country) => (
        <option key={country.cca2} value={country.name.common}>
          {country.name.common}
        </option>
      ))}
          </select>
        </div>
      </div>

      {/* Update Button at the Bottom */}
      <button onClick={handleUpdate} className="w-fit bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 mt-4">
      {!updateLoading? 'Update Employee': 'updating..'}
      </button>
      <p className="py-12">&nbsp;</p>
    </div>
  );
}
