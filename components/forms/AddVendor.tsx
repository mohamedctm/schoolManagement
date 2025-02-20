"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddVendor({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("vendors").insert([{ name, contact_person: contact, phone }]);

    setLoading(false);
    if (error) return alert("Error adding vendor");
    
    alert("Vendor added successfully!");
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Add Vendor</h2>
      <input
        type="text"
        placeholder="Vendor Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-2"
        required
      />
      <input
        type="text"
        placeholder="Contact Person"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-2"
      />
      <input
        type="text"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-700"
      >
        {loading ? "Saving..." : "Add Vendor"}
      </button>
    </form>
  );
}
