"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Employee } from "@/types/employee";
import Heading from "@/components/Heading";

export default function EmployeesPage() {
    return (
        <div className="p-6 max-w-4xl mx-auto h-screen">
          <div className="flex justify-between items-center mb-4">
            <Heading>Student</Heading>
    
          </div>
          </div>
    )
}
