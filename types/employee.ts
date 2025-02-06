// /types/employee.ts

export interface Employee {
    id: number;
    name: string;
    email: string;
    position: string;
    username: string;
    password: string;
    last_name: string;
  }
  
  export interface Salary {
    id: number; // Matches Employee ID
    salary: number;
  }
  
  export interface EmployeeInfo {
    id: number; // Matches Employee ID
    address: string;
    phone_number: string;
  }
  
  export interface EmployeeID {
    id: number; // Matches Employee ID
  }