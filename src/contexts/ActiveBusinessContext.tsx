"use client";

import React, { createContext, useContext } from 'react';
import type { Business } from '@/types';

interface ActiveBusinessContextType {
  activeBusiness: Business | null;
  setActiveBusinessId: (id: string) => void;
}

const ActiveBusinessContext = createContext<ActiveBusinessContextType | undefined>(undefined);

export const ActiveBusinessProvider: React.FC<{
  activeBusiness: Business | null;
  setActiveBusinessId: (id: string) => void;
  children: React.ReactNode;
}> = ({ activeBusiness, setActiveBusinessId, children }) => {
  return (
    <ActiveBusinessContext.Provider value={{ activeBusiness, setActiveBusinessId }}>
      {children}
    </ActiveBusinessContext.Provider>
  );
};

export const useActiveBusiness = () => {
  const context = useContext(ActiveBusinessContext);
  if (context === undefined) {
    throw new Error('useActiveBusiness must be used within an ActiveBusinessProvider');
  }
  return context;
};