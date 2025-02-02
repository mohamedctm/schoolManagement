import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Welcome to the Employee Management System</h1>
      <Link href="/login">
        <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg">
          Login
        </button>
      </Link>
    </div>
  );
}
