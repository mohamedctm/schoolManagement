import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-200 to-purple-600 p-8">
    <h1 className="text-5xl font-bold text-white mb-8">
      School Management System
    </h1>
    <Link href="/login">
      <button className="px-8 py-4 bg-purple-700 text-white rounded-lg shadow-xl hover:bg-purple-800 transition duration-300 ease-in-out">
        ENTER
      </button>
    </Link>
  </div>
  
  );
}
