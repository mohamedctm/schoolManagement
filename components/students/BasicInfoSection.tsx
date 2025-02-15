import { Student } from "@/types/student";

interface BasicInfoSectionProps {
  student: Student;
  setStudent: (student: Student) => void;
}

export default function BasicInfoSection({ student, setStudent }: BasicInfoSectionProps) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-2">Basic Information</h2>
      <input type="text" placeholder="First Name" value={student.first_name} onChange={(e) => setStudent({ ...student, first_name: e.target.value })} />
      <input type="text" placeholder="Last Name" value={student.last_name} onChange={(e) => setStudent({ ...student, last_name: e.target.value })} />
    </div>
  );
}
