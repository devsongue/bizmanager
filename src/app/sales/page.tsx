"use client";

import React from 'react';
import { Sales } from '@/components/sales/Sales';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBusinesses } from '@/hooks/useBusiness';
import { useCreateSale } from '@/hooks/useSale';
import { useAuth } from '@/contexts/AuthContext';

export default function SalesPage() {
  const { data: businesses = [], isLoading: isBusinessesLoading } = useBusinesses();
  const { mutateAsync: createSale } = useCreateSale();
  const { currentUser } = useAuth();
  
  if (isBusinessesLoading) {
    return <div className="flex justify-center items-center h-64">Chargement des ventes...</div>;
  }
  
  return (
    <MainLayout businesses={businesses}>
      <SalesPageContent 
        businesses={businesses} 
        createSale={createSale} 
        currentUser={currentUser} 
      />
    </MainLayout>
  );
}

// Composant séparé pour le contenu de la page
const SalesPageContent = ({ 
  businesses, 
  createSale, 
  currentUser 
}: { 
  businesses: any[]; 
  createSale: any; 
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
  
  const handleAddSale = async (newSale: any) => {
    try {
      await createSale(newSale);
    } catch (error) {
      console.error('Error creating sale:', error);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Sales business={activeBusiness} onAddSale={handleAddSale} />
    </div>
  );
};