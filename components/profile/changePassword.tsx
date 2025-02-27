"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs"; // ✅ Ensure bcryptjs is installed
import Heading from "@/components/Heading";
import { Loader2 } from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function ChangePasswordPage() {
  const { user } = useUser();
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions
    setMessage("");
    setLoading(true);

    try {
      if (!user?.id) {
        setMessage("User not found.");
        setLoading(false);
        return;
      }

      // ✅ Step 1: Fetch current password hash from database
      const { data: employee, error: fetchError } = await supabase
        .from("employees")
        .select("password")
        .eq("id", user.id)
        .single();

      if (fetchError || !employee) {
        setMessage("Failed to fetch user data.");
        setLoading(false);
        return;
      }

      // ✅ Step 2: Compare old password with stored hash
      const isMatch = await bcrypt.compare(form.old_password, employee.password);
      if (!isMatch) {
        setMessage("Old password is incorrect.");
        setLoading(false);
        return;
      }

      // ✅ Step 3: Hash the new password
      const hashedNewPassword = await bcrypt.hash(form.new_password, 10);

      // ✅ Step 4: Update the password in the database
      const { error: updateError } = await supabase
        .from("employees")
        .update({ password: hashedNewPassword })
        .eq("id", user.id);

      if (updateError) {
        setMessage("Error updating password. Please try again.");
        setLoading(false);
        return;
      }

      // ✅ Success Message
      setMessage("Password changed successfully!");
      setForm({ new_password: "", old_password: "" });

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
        <Heading>Change Password</Heading>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <input
          type="password"
          placeholder="Old Password"
          className="w-full p-3 border border-gray-300 rounded mb-3"
          value={form.old_password}
          onChange={(e) => setForm({ ...form, old_password: e.target.value })}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="New Password"
          className="w-full p-3 border border-gray-300 rounded mb-3"
          value={form.new_password}
          onChange={(e) => setForm({ ...form, new_password: e.target.value })}
          required
          disabled={loading}
        />
        <button
          type="submit"
          className={`w-full flex justify-center items-center gap-2 bg-green-700 text-lg text-white px-4 py-3 rounded hover:bg-green-600 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Change Password"}
        </button>
      </form>

      {message && <p className="mt-6 text-center text-lg font-medium text-green-600">{message}</p>}
    </div>
  );
}
