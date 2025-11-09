"use client";

import React from 'react';
import { Expenses } from '@/components/expenses/Expenses';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBusinesses } from '@/hooks/useBusiness';
import { useCreateExpense } from '@/hooks/useExpense';
import { useAuth } from '@/contexts/AuthContext';

export default function ExpensesPage() {
  const { data: businesses = [], isLoading: isBusinessesLoading } = useBusinesses();
  const { mutateAsync: createExpense } = useCreateExpense();
  const { currentUser } = useAuth();
  
  if (isBusinessesLoading) {
    return <div className="flex justify-center items-center h-64">Chargement des dépenses...</div>;
  }
  
  return (
    <MainLayout businesses={businesses}>
      <ExpensesPageContent 
        businesses={businesses} 
        createExpense={createExpense} 
        currentUser={currentUser} 
      />
    </MainLayout>
  );
}

// Composant séparé pour le contenu de la page
const ExpensesPageContent = ({ 
  businesses, 
  createExpense, 
  currentUser 
}: { 
  businesses: any[]; 
  createExpense: any; 
  currentUser: any; 
}) => {
  // Filtrer les entreprises en fonction de l'utilisateur actuel
  let activeBusiness;
  
  if (currentUser?.role === 'Admin') {
    // Pour les administrateurs, utiliser la première entreprise
    activeBusiness = businesses[0];
  } else if (currentUser?.role === 'Gérant' && currentUser.managedBusinessIds && currentUser.managedBusinessIds.length > 0) {
    // Pour les gérants, utiliser la première entreprise assignée
    activeBusiness = businesses.find(b => b.id === currentUser.managedBusinessIds![0]);
  }
  
  // Si aucune entreprise active n'est trouvée, utiliser la première entreprise disponible
  if (!activeBusiness) {
    activeBusiness = businesses[0];
  }
  
  if (!activeBusiness) {
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
    <div className="p-4 md:p-8">
      <Expenses business={activeBusiness} onAddExpense={handleAddExpense} />
    </div>
  );
};