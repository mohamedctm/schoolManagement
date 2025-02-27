"use client";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import EditSubject from "@/components/class/EditSubjects";

export default function Page() {
  const params = useParams(); // Get the employee ID from the URL
  const id = params.id as string; // Ensure id is treated as a string

  return (
    <Suspense fallback={<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mx-auto mt-6"></div>}>
      <EditSubject id={id} />
    </Suspense>
  );
}