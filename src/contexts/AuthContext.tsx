"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticateUser } from '@/hooks/useUser';
import { User } from '@/types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authenticateUserMutation = useAuthenticateUser();
  const router = useRouter();

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('authToken');
    
    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await authenticateUserMutation.mutateAsync({ email, password });
      if (result.success) {
        const user = result.data;
        setCurrentUser(user as User);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Stocker un token simulé pour le middleware
        const simulatedToken = btoa(JSON.stringify({ userId: user.id, email: user.email, role: user.role, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
        localStorage.setItem('authToken', simulatedToken);
        // Définir le cookie pour le middleware
        document.cookie = `auth-token=${simulatedToken}; path=/; max-age=604800; SameSite=Lax`;
        
        return true;
      } else {
        // Clear any existing user data on failed login
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        // Effacer le cookie
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      // Clear any existing user data on error
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      // Effacer le cookie
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear user data
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    
    // Effacer le cookie
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'redirect-url=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Redirect to login page
    router.push('/login');
  };

  const value = {
    currentUser,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};