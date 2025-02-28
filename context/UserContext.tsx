"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  name: string;
  last_name: string;
  level: string;
}

const initialEmployeeState: User = {
  id: 0,
  name: "",
  username: "",
  last_name: "",
  level: "",
};

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
}

// ✅ Create Context with a default value
const UserContext = createContext<UserContextType>({
  user: initialEmployeeState,
  setUser: () => {},
});

// ✅ Create Provider Component
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(initialEmployeeState);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();

        // Validate the API response
        if (!data || typeof data !== "object") {
          throw new Error("Invalid user data received");
        }

        setUser({
          id: data.id || null,
          username: data.username || "",
          name: data.name || "",
          last_name: data.last_name || "",
          level: data.level || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Optionally, set a fallback user state or display an error message
      }
    };

    fetchUserData();
  }, []);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

// ✅ Hook to use user context in any component
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    console.error("useUser must be used within a UserProvider");
    return { user: initialEmployeeState, setUser: () => {} }; // Fallback
  }
  return context;
}