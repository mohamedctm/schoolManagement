export default function Edit({ children }: { children: React.ReactNode }) {
    return (
      <span className="bg-purple-600 text-white px-3 py-1 b rounded hover:bg-pink-500">
        {children}
      </span>
    );
  }