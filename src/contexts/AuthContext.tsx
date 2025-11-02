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
    // Check for existing session (in a real app, you would verify the session token)
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('currentUser');
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
        return true;
      } else {
        // Clear any existing user data on failed login
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      // Clear any existing user data on error
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear user data
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    
    // Redirect to login page
    router.push('/login');
  };

  const value = {
    currentUser,
    login,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};