import { Suspense } from "react";
import StudentPage from "@/components/StudentPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mx-auto mt-6"></div>}>
      <StudentPage />
    </Suspense>
  );
}
