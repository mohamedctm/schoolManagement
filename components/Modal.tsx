"use client";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}
export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 opacity-97 overflow-y-auto py-6 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative w-96">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-5xl"
        >
          &times;
        </button>
        <div className="overflow-y-scroll p-4">{children}</div>
        
      </div>
    </div>
  );
}
