"use client";

import React from 'react';
import { Expenses } from '@/components/expenses/Expenses';
import { useCreateExpense } from '@/hooks/useExpense';
import { useActiveBusiness } from '@/contexts/ActiveBusinessContext';
import type { Business } from '@/types';

interface ExpensesContentProps {
  activeBusiness?: Business;
}

export const ExpensesContent: React.FC<ExpensesContentProps> = ({ activeBusiness }) => {
  const { mutateAsync: createExpense } = useCreateExpense();
  
  // Use context if no prop is provided (for backward compatibility)
  const { activeBusiness: contextBusiness } = useActiveBusiness();
  const business = activeBusiness || contextBusiness;
  
  if (!business) {
    return <div className="flex justify-center items-center h-64">Aucune entreprise trouvée.</div>;
  }
  
  const handleAddExpense = async (newExpense: any) => {
    try {
      await createExpense(newExpense);
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  return (
    <Expenses business={business} onAddExpense={handleAddExpense} />
  );
};