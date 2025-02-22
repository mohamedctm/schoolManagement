"use client";

import { useState } from "react";

export default function ProgressBar({ current, total }: { current: number; total: number }) {
    const current_count = current;
    const total_count = total;
  const progress = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  return (
    <div className="w-full bg-blue-300 flex  h-4 my-2 relative overflow-hidden">
      <div
        className="bg-blue-500 h-4  p-4 transition-all w-[140px] duration-800"
        style={{ width: `${progress}%` }}
      ></div>
      <span className="absolute inset-0 flex justify-center items-center text-xs font-semibold text-gray-200">
       {current_count} / {total_count}
       {/* {progress.toFixed(1)}%  */}
      </span>
      
    </div> 
  );
};