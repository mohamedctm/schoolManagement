export default function Heading({ children }: { children: React.ReactNode }) {
    return (
      <h1 className="text-4xl font-bold bg-gradient-to-r from-fuchsia-700 to-yellow-500 bg-clip-text text-transparent mb-6">
        {children}
      </h1>
    );
  }
  