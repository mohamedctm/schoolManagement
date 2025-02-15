import { Parents } from "@/types/student";

interface ParentInfoSectionProps {
  title: string;
  parentData: Parents;
  setParents: (parents: Parents) => void;
  parentKey: "parent_one" | "parent_two";
}

export default function ParentInfoSection({ title, parentData, setParents, parentKey }: ParentInfoSectionProps) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <input
        type="text"
        placeholder="First Name"
        value={parentData[`${parentKey}_first_name`] || ""}
        onChange={(e) => setParents({ ...parentData, [`${parentKey}_first_name`]: e.target.value })}
      />
      <input
        type="text"
        placeholder="Last Name"
        value={parentData[`${parentKey}_last_name`] || ""}
        onChange={(e) => setParents({ ...parentData, [`${parentKey}_last_name`]: e.target.value })}
      />
    </div>
  );
}
