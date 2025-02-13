export default function Heading({ children }: { children: React.ReactNode }) {
    return (
      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-950 to-blue-500 bg-clip-text text-transparent mb-6">
        {children}
      </h1>
    );
  }
  