// /types/employee.ts

export interface Student {
    id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    birth_date: string;
    gender: string;
    enrollment_status: boolean;
  }
  export interface Medical {
    id: number;
    has_health_issues: boolean;
    has_chronic_diseases: boolean;
    chronic_diseases: string;
    has_allergies: boolean;
    allergies: string;
    medication: string;
  }
  
  export interface Parents {
    id: number; // Matches student ID
    parent_one_first_name: string;
    parent_one_last_name: string;
    parent_two_first_name: string;
    parent_two_last_name: string;
    parent_one_status: string;
    parent_two_status: string;
    parent_one_nationality: string;
    parent_two_nationality: string;
    parent_one_residency_status: string;
    parent_two_residency_status: string;
    address: string;
    address_country: string;
    phone_number1: string;
    phone_number2: string;
    emergency_fname: string,
    emergency_lname: string,
    emergency_number: string,
    relation: string,

  }
  
  