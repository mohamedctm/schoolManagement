"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs"; // Ensure bcryptjs is installed
import Heading from "@/components/Heading";
import { Loader2 } from "lucide-react";
import { useUser } from "@/context/UserContext";

interface Employee {
  id: number;
  name: string;
  last_name: string;
  username: string;
  level: string;
}

export default function ManageUserPage() {
  const { user } = useUser(); // Logged-in user
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    new_password: "",
    old_password: "",
  });
  const [level, setLevel] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // ✅ Fetch employees (excluding self)
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, name, last_name, username, level")
        .not("username", "is", null) // Exclude employees without usernames
        .neq("id", user.id); // Exclude self

      if (error) {
        console.error("Error fetching employees:", error);
      } else {
        setEmployees(data);
      }
    };

    fetchEmployees();
  }, [user.id]);

  // ✅ Show popup message and auto-hide after 5 seconds
  useEffect(() => {
    if (message) {
      setShowPopup(true);
      const timer = setTimeout(() => {
        setShowPopup(false);
        setMessage(""); // Clear message after hiding
      }, 5000);

      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [message]);

  // ✅ Handle Employee Selection
  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const empId = Number(e.target.value);
    const selected = employees.find(emp => emp.id === empId);
    setSelectedEmployee(empId);
    setLevel(selected?.level || ""); // ✅ Set the current level
    setPasswordForm({ new_password: "", old_password: "" });
    setMessage("");
  };

  // ✅ Handle Password Change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; 
    if (!selectedEmployee) {
      setMessage("Please select an employee.");
      return;
    }

    setMessage("");
    setLoading(true);

    try {
      const hashedNewPassword = await bcrypt.hash(passwordForm.new_password, 10);

      const { error: updateError } = await supabase
        .from("employees")
        .update({ password: hashedNewPassword })
        .eq("id", selectedEmployee);

      if (updateError) {
        setMessage("Error updating password. Please try again.");
        setLoading(false);
        return;
      }

      setMessage("Password updated successfully!");
      setPasswordForm({ new_password: "", old_password: "" });

    } catch (error) {
      console.log("Unexpected error:", error);
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Level Change (Admin Only)
  const handleLevelChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; 
    if (!selectedEmployee) {
      setMessage("Please select an employee.");
      return;
    }

    setMessage("");
    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from("employees")
        .update({ level })
        .eq("id", selectedEmployee);

      if (updateError) {
        setMessage("Error updating level. Please try again.");
        setLoading(false);
        return;
      }

      setMessage("User level updated successfully!");

    } catch (error) {
      console.log("Unexpected error:", error);
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto h-fit">
      <div className="text-center w-full mb-4">
        <Heading>Manage User</Heading>
      </div>

      {/* Select Employee (Excluding Self) */}
      <div className="mb-4">
        <label className="block text-lg font-medium text-gray-700">Select Employee</label>
        <select
          value={selectedEmployee || ""}
          onChange={handleEmployeeChange}
          className="w-full p-3 border border-gray-300 rounded mb-3"
          required
        >
          <option value="" disabled>Select an Employee</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} {emp.last_name} ({emp.username})
            </option>
          ))}
        </select>
      </div>

      {/* Password Change Form */}
      {selectedEmployee && (
        <form onSubmit={handlePasswordChange} className="bg-white shadow rounded-lg p-6 mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Change Password</h3>

          <input
            type="password"
            placeholder="New Password"
            className="w-full p-3 border border-gray-300 rounded mb-3"
            value={passwordForm.new_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
            required
            disabled={loading}
          />

          <button
            type="submit"
            className={`w-full flex justify-center items-center gap-2 bg-blue-600 text-lg text-white px-4 py-3 rounded hover:bg-blue-500 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Change Password"}
          </button>
        </form>
      )}

      {/* Level Change Form */}
      {selectedEmployee && user.level === "admin" && (
        <form onSubmit={handleLevelChange} className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Change User Level</h3>

          <select
            className="w-full p-3 border border-gray-300 rounded mb-3"
            value={level} // ✅ Shows the current level
            onChange={(e) => setLevel(e.target.value)}
            required
          >
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="teacher">Teacher</option>
          </select>

          <button
            type="submit"
            className="w-full bg-green-600 text-white px-4 py-3 rounded hover:bg-green-500 transition"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Change Level"}
          </button>
        </form>
      )}

      {/* ✅ Popup Message */}
      {showPopup && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white text-lg px-6 py-4 rounded shadow-lg z-50">
          {message}
        </div>
      )}
    </div>
  );
}
