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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-3xl"
          aria-label="Close"
        >
          &times;
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
}
