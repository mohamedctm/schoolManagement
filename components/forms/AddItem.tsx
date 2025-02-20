"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AddItem({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return alert("Please select a category");

    const { error } = await supabase.from("items").insert([{ name, category_id: categoryId }]);
    if (error) return alert("Error adding item");
    
    alert("Item added successfully!");
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Add Item</h2>
      <input
        type="text"
        placeholder="Item Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-2"
        required
      />
      <select
        value={categoryId || ""}
        onChange={(e) => setCategoryId(Number(e.target.value))}
        className="w-full p-2 border border-gray-300 rounded mb-2"
      >
        <option value="">Select Category</option>
      </select>
      <button
        type="submit"
        className="bg-purple-500 text-white px-4 py-2 rounded w-full hover:bg-purple-700"
      >
        Add Item
      </button>
    </form>
  );
}
