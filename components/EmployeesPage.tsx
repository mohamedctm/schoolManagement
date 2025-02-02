"use client";
import Layout from "@/app/layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({ 
    id: "", 
    name: "", 
    email: "", 
    position: "", 
    username: "", 
    password: "" 
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const positions = ["CEO", "Manager", "Director", "Accountant", "Teacher"];

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch('/api/auth', { credentials: 'include' });

      if (!response.ok) {
        router.push('/login');
        return;
      }

      fetchEmployees();
    };

    checkAuth();
  }, [router]);

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("employees")
      .select("id, name, email, position, username");

    if (!error) setEmployees(data || []);
  };

  const handleAddOrUpdateEmployee = async () => {
    if (isEditing) {
      const confirmEdit = confirm("Are you sure you want to update this employee?");
      if (!confirmEdit) return;

      await supabase
        .from("employees")
        .update({
          name: form.name,
          email: form.email,
          position: form.position,
          username: form.username
        })
        .eq("id", form.id);
    } else {
      await supabase.from("employees").insert([
        {
          name: form.name,
          email: form.email,
          position: form.position,
          username: form.username,
          password: form.password,
        }
      ]);
    }
    resetForm();
    fetchEmployees();
  };

  const handleDeleteEmployee = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this employee?");
    if (!confirmDelete) return;

    await supabase.from("employees").delete().eq("id", id);
    fetchEmployees();
  };

  const handleEditEmployee = (employee: any) => {
    setForm({ ...employee, password: "" });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleViewEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({ id: "", name: "", email: "", position: "", username: "", password: "" });
    setIsEditing(false);
    setShowForm(false);
  };

  return (
    
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Employees</h1>

      

      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
      >
        {showForm ? "Hide Form" : "Add Employee"}
      </button>

      {showForm && (
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <label className="block mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full p-2 mb-2 border border-gray-300 rounded"
          />
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full p-2 mb-2 border border-gray-300 rounded"
          />
          <label className="block mb-1">Position</label>
          <select
            value={form.position}
            onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))}
            className="w-full p-2 mb-2 border border-gray-300 rounded"
          >
            <option value="">Select Position</option>
            {positions.map((pos) => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
          <label className="block mb-1">Username</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            className="w-full p-2 mb-2 border border-gray-300 rounded"
          />
          {!isEditing && (
            <>
              <label className="block mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full p-2 mb-2 border border-gray-300 rounded"
              />
            </>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleAddOrUpdateEmployee}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              {isEditing ? "Update Employee" : "Add Employee"}
            </button>
            {isEditing && (
              <button
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      <ul className="bg-white shadow rounded-lg p-4" >
      {employees.length === 0 ? (
    <p className="text-gray-500">No employees found.</p>
  ) : (
    employees
      .slice() // ✅ Create a new array to avoid mutating state
      .sort((a, b) => a.name.localeCompare(b.name)) // ✅ Sort employees alphabetically (ASC)
      .map((employee) => (
        <li key={employee.id} className="flex justify-between items-center border-b p-2 last:border-none">
          <div>
            <p className="font-semibold">{employee.name} ({employee.position})</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleViewEmployee(employee)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">View</button>
            <button onClick={() => handleEditEmployee(employee)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Edit</button>
            <button onClick={() => handleDeleteEmployee(employee.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
          </div>
        </li>
      ))
  )}
</ul>

      {showModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-2">{selectedEmployee.name}</h2>
            <p>Email: {selectedEmployee.email}</p>
            <p>Position: {selectedEmployee.position}</p>
            <p>Username: {selectedEmployee.username}</p>
            <button onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-4 py-2 mt-4 rounded hover:bg-gray-600">Close</button>
          </div>
        </div>
      )}
    </div>
    
  );
}
