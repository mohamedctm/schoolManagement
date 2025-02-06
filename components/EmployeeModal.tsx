// components/EmployeeModal.tsx
import { Employee } from "@/types/employee";

interface EmployeeModalProps {
  employee: Employee;
  onClose: () => void;
}

export default function EmployeeModal({ employee, onClose }: EmployeeModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-2">{employee.name}</h2>
        <p>Email: {employee.email}</p>
        <p>Position: {employee.position}</p>
        <p>Username: {employee.username}</p>
        <button
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 mt-4 rounded hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}