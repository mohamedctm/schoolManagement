// /types/employee.ts

export interface Class {
    serial: number;
    create_at: string;
    class_grade: number;
    class_name: string;
    class_size: number;
    class_description: string;
  }
  
  export interface Assignment {
    assigned_serial: number; // Matches Employee ID
    created_at: string;
    student_id: number;
    class_id: number;
  }
  export interface Subject {
    id : number; 
    subject_name: string;
    
  }

  export interface SubjectAssignment {
    assigned_serial: number; // Matches Employee ID
    created_at: string;
    subject_id: number;
    class_id: number;
  }

  export interface TeacherAssignment {
    assigned_serial: number; // Matches Employee ID
    created_at: string;
    teacher_id: number;
    class_id: number;
  }
  
  
