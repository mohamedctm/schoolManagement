"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import Modal from "@/components/Modal";
import ChangePassword from "@/components/profile/changePassword";
import AlterUsers from "@/components/profile/alterUsers";
import ExamPage from "@/components/profile/Exam";
import { Lock, Users } from "lucide-react";

export default function Profile() {
  const { user } = useUser();
  const [modal, setModal] = useState<string | null>(null);

  return (
    <div className="p-4">
      {/* ✅ Modal for Change Password */}
      {modal === "changepassword" && (
        <Modal isOpen onClose={() => setModal(null)}>
          <ChangePassword />
        </Modal>
      )}

      {/* ✅ Modal for Alter Users (Only for Admins) */}
      {modal === "alterusers" && user.level === "admin" && (
        <Modal isOpen onClose={() => setModal(null)}>
          <AlterUsers />
        </Modal>
      )}

      {/* ✅ Modal for Create Exam (Only for Admins) */}
      {modal === "createexam" && user.level === "admin" && (
        <Modal isOpen onClose={() => setModal(null)}>
          <ExamPage />
        </Modal>
      )}

      <div className="w-full p-4 flex flex-row flex-wrap gap-4">
        {/* ✅ Change Password Button (Shown to Everyone) */}
        <button
          onClick={() => setModal("changepassword")}
          className="flex items-center justify-center gap-2 bg-blue-200 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-600 hover:text-blue-200 transition"
        >
          <Lock size={20} /> Change Password
        </button>

        {/* ✅ Show Admin-Only Buttons */}
        {user.level === "admin" && (
          <div className="flex flex-row gap-4">
            {/* ✅ Create Exam (Only Admins) */}
            <button
              onClick={() => setModal("createexam")}
              className="flex items-center justify-center gap-2 bg-blue-200 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-600 hover:text-blue-200 transition"
            >
              Create Exam
            </button>

            {/* ✅ Modify Employee (Only Admins) */}
            <button
              onClick={() => setModal("alterusers")}
              className="flex items-center justify-center gap-2 bg-blue-200 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-600 hover:text-blue-200 transition"
            >
              <Users size={20} /> Modify Employee
            </button>
          </div>
        )}
      </div>

      {/* ✅ User Information Display */}
      <div>
        {user.name} {user.last_name} <br /> Level: {user.level}
      </div>
    </div>
  );
}
