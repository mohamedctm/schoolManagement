"use client";

import { useState } from "react";

export default function ProgressBar({ current, total }: { current: number; total: number }) {
  const progress = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  return (
    <div className="w-full bg-blue-600 flex rounded-lg h-4 relative overflow-hidden">
      <div
        className="bg-red-500 h-4 rounded-lg py-4 transition-all w-[140px] duration-800"
        style={{ width: `${progress}%` }}
      ></div>
      <span className="absolute inset-0 flex justify-center items-center text-xs font-semibold text-gray-200">
        {progress.toFixed(1)}%
      </span>
    </div>
  );
};