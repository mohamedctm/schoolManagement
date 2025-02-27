// /types/employee.ts

export interface Exam {
    serial: number;
    create_at: string;
    exam_name: string;
    exam_type: string;
    exam_year: number;
  }
  
  export interface ExamAssignment {
    exam_serial: number; // Matches Employee ID
    created_at: string;
    exam_id: number;
    student_id: number;
    class_id: number;
    result: number;
  }
  
  
  
