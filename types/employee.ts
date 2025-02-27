// /types/employee.ts

export interface Employee {
    id: number;
    name: string;
    email: string;
    position: string;
    username: string;
    password: string;
    last_name: string;
    level: string;
  }
  export interface User {
    id: number;
    name: string;
    username: string;
    last_name: string;
    level: string;
  }
  
  export interface Salary {
    id: number; // Matches Employee ID
    salary: number;
    contract_length: number;
    contract_copy: string;
  }
  
  export interface EmployeeInfo {
    id: number; // Matches Employee ID
    address: string;
    phone_number: string;
    marital_status: string;
    residency_status: string;
    nationality: string;
    residency_country: string;
    identification_type: string;
    identification_number: string;
    gender:string;
    birth_date: string;
  }
  
  export interface EmployeeID {
    id: number; // Matches Employee ID
  }