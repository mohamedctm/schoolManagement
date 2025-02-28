"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Employee } from "@/types/employee";
import Heading from "@/components/Heading";
import bcrypt from "bcryptjs";

interface EditEmployeeFormProps {
  id: number;
  onAccountCreated?: () => void;
}

export default function Username({ id,onAccountCreated }: EditEmployeeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [accountCreated, setAccountCreated] = useState(false); // ✅ Hide form after successful submission

  const [employee, setEmployee] = useState<Employee>({
    id: 0,
    name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    position: "",
    level: "",
  });

  const [repeatPassword, setRepeatPassword] = useState("");

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const { data: empData, error: empError } = await supabase
          .from("employees")
          .select("*")
          .eq("id", id)
          .single();

        if (empError) throw empError;
        setEmployee(empData);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setMessage("Failed to fetch employee info data.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [id]);

  // ✅ Check if username exists on input change
  const checkUsernameExists = async (username: string) => {
    if (!username.trim()) {
      setUsernameError("");
      return;
    }

    const { data: existingUser } = await supabase
      .from("employees")
      .select("id")
      .eq("username", username)
      .neq("id", id)
      .single();

    if (existingUser) {
      setUsernameError("Username already exists. Choose another one.");
    } else {
      setUsernameError("");
    }
  };

  const handleUpdate = async () => {
    setMessage("");
    setError("");

    if (!employee.username || !employee.password || !repeatPassword) {
      setError("All fields are required.");
      return;
    }

    if (employee.password !== repeatPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (usernameError) {
      setError(usernameError);
      return;
    }

    try {
      // ✅ Hash the new password before updating
      const hashedPassword = await bcrypt.hash(employee.password, 10);

      const { error } = await supabase
        .from("employees")
        .update({
          username: employee.username,
          password: hashedPassword,
        })
        .eq("id", id);

      if (error) throw error;

      setMessage("Account created successfully!");
      setAccountCreated(true); // ✅ Hide form after successful submission
    } catch (error) {
      console.error("Error updating username and password:", error);
      setError("Failed to create account.");
    }
    if (onAccountCreated) {
      onAccountCreated(); // ✅ Notify parent to refresh employee data
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="p-4 max-w-lg mx-auto min-h-fit flex flex-col justify-center">
      {/* Page Heading */}
      <div className="flex justify-between items-center mb-6">
        <Heading>Create Username</Heading>
      </div>

      {/* Success / Error Messages */}
      {message && <p className="text-center text-green-600 font-semibold mb-4">{message}</p>}
      {error && <p className="text-center text-red-600 font-semibold mb-4">{error}</p>}

      {/* ✅ Show Account Created Message & Hide Form */}
      {accountCreated ? (
        <div className="text-center text-green-700 font-bold text-lg py-6">
          ✅ Account Created Successfully!
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          {/* Employee Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Employee Information</h2>
            <p className="text-gray-600">{employee.name} {employee.last_name}</p>
          </div>

          {/* Username & Password Fields */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Set Username & Password</h2>

            {/* Username Input */}
            <input
              type="text"
              placeholder="New Username"
              autoComplete="off"
              name="employeeusername"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={employee.username || ""}
              onChange={(e) => {
                setEmployee({ ...employee, username: e.target.value });
                checkUsernameExists(e.target.value); // ✅ Check username existence on change
              }}
              required
            />
            {usernameError && <p className="text-red-500 text-sm mt-1">{usernameError}</p>}

            {/* Password Input */}
            <input
              type="password"
              autoComplete="new-password"
              name="newpassword"
              placeholder="New Password"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
              value={employee.password || ""}
              onChange={(e) => setEmployee({ ...employee, password: e.target.value })}
              required
            />

            {/* Repeat Password Input */}
            <input
              type="password"
              autoComplete="new-password"
              name="repeatpassword"
              placeholder="Repeat Password"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              required
            />
          </div>

          {/* Update Button */}
          <button
            onClick={handleUpdate}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Create Account
          </button>
        </div>
      )}
    </div>
  );
}
