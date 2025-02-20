// components/ParentInfo.tsx
"use client";
import { Parents } from "@/types/student";
import countries from "world-countries";


interface ParentInfoProps {
  parent: Parents;
  onUpdate: (field: string, value: string) => void;
  type: "parent1" | "parent2";
}

export default function ParentInfo({ parent, onUpdate, type }: ParentInfoProps) {
  const prefix = type === "parent1" ? "parent_one" : "parent_two";

  return (
    <div className="mt-4 border border-gray-300 rounded-lg p-6">
      <label className="block text-green-800 font-medium mb-1">&nbsp;First name</label>
      <input type="text" placeholder="first name" className="w-full p-2 border border-gray-300 rounded mb-2" value={parent[`${prefix}_first_name`] || ""} onChange={(e) => onUpdate(`${prefix}_first_name`, e.target.value)} />
      <label className="block text-green-800 font-medium mb-1">&nbsp;Last name</label>
      <input type="text" placeholder="last name" className="w-full p-2 border border-gray-300 rounded mb-2" value={parent[`${prefix}_last_name`] || ""} onChange={(e) => onUpdate(`${prefix}_last_name`, e.target.value)} />
      <label className="block text-green-800 font-medium mb-1">&nbsp;Martial Status</label>
      <select className="w-full p-2 border border-gray-300 rounded mb-2" value={parent[`${prefix}_status`] || ""} onChange={(e) => onUpdate(`${prefix}_status`, e.target.value)} >
        <option value="" disabled>Martial Status</option>
        <option value="Single">Single</option>
        <option value="Married">Married</option>
        <option value="Divorced">Divorced</option>
      </select>
      <label className="block text-green-800 font-medium mb-1">&nbsp;phone number</label>
      <input type="text" placeholder="contact number 1" className="w-full p-2 border border-gray-300 rounded mb-2" value={parent[`phone_number${type === "parent1" ? "1" : "2"}`] || ""} onChange={(e) => onUpdate(`phone_number${type === "parent1" ? "1" : "2"}`, e.target.value)} />
      <label className="block text-green-800 font-medium mb-1">&nbsp;Nationality</label>
      <select className="w-full p-2 border border-gray-300 rounded mb-2"
        value={parent[`${prefix}_nationality`] || ""}
        onChange={(e) => onUpdate(`${prefix}_nationality`, e.target.value)} >
        <option value="" disabled>Select Nationality</option>
        {countries.map((country) => (
          <option key={country.cca2} value={country.name.common}>
            {country.name.common}
          </option>
        ))}
      </select>
      <label className="block text-green-800 font-medium mb-1">&nbsp;Residential Status</label>
      <select className="w-full p-2 border border-gray-300 rounded mb-2" value={parent[`${prefix}_residency_status`] || ""} onChange={(e) => onUpdate(`${prefix}_residency_status`, e.target.value)} >
        <option value="" disabled>Residency Status</option>
        <option value="Citizen">Citizen</option>
        <option value="Resident">Resident</option>
        <option value="Refugee">Refugee</option>
      </select>
    </div>
  );
}