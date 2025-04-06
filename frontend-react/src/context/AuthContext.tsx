import React, { useState, useMemo, ReactNode } from "react";
import { LoginSuccessPayload } from "@/types"; // Assuming you have this type
import { AuthContext } from "@/hooks/useAuth";

export interface AuthContextType {
  isAuthenticated: boolean;
  user: LoginSuccessPayload | null;
  login: (userData: LoginSuccessPayload) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<LoginSuccessPayload | null>(() => {
    // Optional: Initialize state from localStorage if needed (less secure for auth status)
    // const storedUser = localStorage.getItem('user');
    // return storedUser ? JSON.parse(storedUser) : null;
    return null; // Start as logged out
  });

  const isAuthenticated = !!user;

  const login = (userData: LoginSuccessPayload) => {
    setUser(userData);
    // Optional: Store non-sensitive user info in localStorage
    // localStorage.setItem('user', JSON.stringify({ id: userData.id, email: userData.email }));
  };

  const logout = () => {
    setUser(null);
    // Optional: Clear localStorage
    // localStorage.removeItem('user');
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      user,
      login,
      logout,
    }),
    [isAuthenticated, user], // Dependencies for memoization
  );

  console.log("AuthContext:", user);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
