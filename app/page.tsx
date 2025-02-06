import Link from 'next/link';
import Heading from "@/components/Heading";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8">
  <Heading>
   School Management System </Heading>
    <Link href="/login">
      <button className="px-8 py-4 bg-yellow-400 text-white rounded-lg shadow-xl hover:bg-pink-500 transition duration-300 ease-in-out">
        ENTER
      </button>
    </Link>
  </div>
  
  );
}
