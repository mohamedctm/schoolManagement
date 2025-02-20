"use client";
import { useState } from "react";
import Modal from "@/components/Modal";
import AddCategory from "@/components/forms/AddCategory";
import AddVendor from "@/components/forms/AddVendor";
// import AddItem from "@/components/forms/AddItem";

export default function PurchasePage() {
  const [modal, setModal] = useState<string | null>(null);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Purchase Management</h1>
      <div className="flex flex-row justify-start gap-6">
      <button onClick={() => setModal("category")}>Add Category</button>
      <button onClick={() => setModal("vendor")}>Add Vendor</button>
      {/* <button onClick={() => setModal("item")}>Add Item</button> */}
      </div>
     

      {modal === "category" && <Modal isOpen onClose={() => setModal(null)}><AddCategory onClose={() => setModal(null)} /></Modal>}
      {modal === "vendor" && <Modal isOpen onClose={() => setModal(null)}><AddVendor onClose={() => setModal(null)} /></Modal>}
      {/* {modal === "item" && <Modal isOpen onClose={() => setModal(null)}><AddItem onClose={() => setModal(null)} /></Modal>} */}
    </div>
  );
}
