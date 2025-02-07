// components/EmployeeList.tsx
import { Employee } from "@/types/employee";

interface EmployeeListProps {
  employees: Employee[];
  handleViewEmployee: (employee: Employee) => void;
  handleEditEmployee: (employee: Employee) => void;
  handleDeleteEmployee: (id: number) => void;
}

export default function EmployeeList({
  employees,
  handleViewEmployee,
  handleEditEmployee,
  handleDeleteEmployee,
}: EmployeeListProps) {
  return (
    <ul className="bg-white shadow rounded-lg p-4">
      {employees.length === 0 ? (
        <p className="text-gray-500">No employees found.</p>
      ) : (
        employees
          .slice() // Create a copy to avoid state mutation
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((employee) => (
            <li
              key={employee.id}
              className="flex justify-between items-center border-b p-2 last:border-none"
            >
              <div>
                <p className="font-semibold">
                  {employee.name} ({employee.position})
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewEmployee(employee)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  View
                </button>
                <button
                  onClick={() => handleEditEmployee(employee)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteEmployee(employee.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))
      )}
    </ul>
  );
}