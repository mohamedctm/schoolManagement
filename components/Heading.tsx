export default function Heading({ children }: { children: React.ReactNode }) {
    return (
      <h1 className="text-2xl font-bold text-black bg-clip-text mb-6">
        {children}
      </h1>
    );
  }
  