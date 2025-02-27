"use client";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import AssignStudent from "@/components/students/Assign";
interface EditStudentFormProps {
    id: number;
  }
export default function Page({id}:EditStudentFormProps) {

  return (
    <Suspense fallback={<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mx-auto mt-6"></div>}>
      <AssignStudent id={id} />
    </Suspense>
  );
}