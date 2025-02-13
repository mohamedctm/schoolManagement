import Link from 'next/link';
import Heading from "@/components/Heading";
import { Home, Mail, DoorOpen, Info } from "lucide-react";


export default function About() {
  return (
    <div>
    <nav className="bg-white text-gray-700 gap-6 p-5 flex justify-start border-b border-gray-300">
    <Link
      href="/"
      className="mr-4 flex items-center gap-2 "
    >
      <Home size={20} /> Home
    </Link>
    <Link
      href="/about"
      className="mr-4 flex items-center gap-2"
      
    >
      <Info size={20} /> about us
    </Link>
    <Link
      href="/contact"
      className="mr-4 flex items-center gap-2"
    >
      <Mail size={20} /> contact
    </Link>
    <Link
      href="/login"
      className="mr-4 flex items-center gap-2"
    >
      <DoorOpen size={20} /> login
    </Link>
    </nav>  
        <p className="text-l text-gray:500 py-10 text-center">about us page </p>
    </div>  
);
}
