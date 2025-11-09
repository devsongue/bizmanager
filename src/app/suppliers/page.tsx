"use client";

import React from 'react';
import { Suppliers } from '@/components/suppliers/Suppliers';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBusinesses } from '@/hooks/useBusiness';
import { useCreateSupplier } from '@/hooks/useSupplier';
import { useAuth } from '@/contexts/AuthContext';

export default function SuppliersPage() {
  const { data: businesses = [], isLoading: isBusinessesLoading } = useBusinesses();
  const { mutateAsync: createSupplier } = useCreateSupplier();
  const { currentUser } = useAuth();
  
  if (isBusinessesLoading) {
    return <div className="flex justify-center items-center h-64">Chargement des fournisseurs...</div>;
  }
  
  return (
    <MainLayout businesses={businesses}>
      <SuppliersPageContent 
        businesses={businesses} 
        createSupplier={createSupplier} 
        currentUser={currentUser} 
      />
    </MainLayout>
  );
}

// Composant séparé pour le contenu de la page
const SuppliersPageContent = ({ 
  businesses, 
  createSupplier, 
  currentUser 
}: { 
  businesses: any[]; 
  createSupplier: any; 
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
  
  const handleAddSupplier = async (newSupplier: any) => {
    try {
      await createSupplier(newSupplier);
    } catch (error) {
      console.error('Error creating supplier:', error);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Suppliers business={activeBusiness} onAddSupplier={handleAddSupplier} />
    </div>
  );
};