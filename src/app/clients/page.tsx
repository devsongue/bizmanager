"use client";

import React from 'react';
import { Clients } from '@/components/clients/Clients';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBusinesses } from '@/hooks/useBusiness';
import { useCreateClient } from '@/hooks/useClient';
import { useAuth } from '@/contexts/AuthContext';

export default function ClientsPage() {
  const { data: businesses = [], isLoading: isBusinessesLoading } = useBusinesses();
  const { mutateAsync: createClient } = useCreateClient();
  const { currentUser } = useAuth();
  
  if (isBusinessesLoading) {
    return <div className="flex justify-center items-center h-64">Chargement des clients...</div>;
  }
  
  return (
    <MainLayout businesses={businesses}>
      <ClientsPageContent 
        businesses={businesses} 
        createClient={createClient} 
        currentUser={currentUser} 
      />
    </MainLayout>
  );
}

// Composant séparé pour le contenu de la page
const ClientsPageContent = ({ 
  businesses, 
  createClient, 
  currentUser 
}: { 
  businesses: any[]; 
  createClient: any; 
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
  
  const handleAddClient = async (newClient: any) => {
    try {
      await createClient(newClient);
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };
  
  const handleRecordPayment = async (clientId: string, amount: number) => {
    // Implementation would go here
    console.log('Recording payment for client:', clientId, 'Amount:', amount);
  };

  return (
    <div className="p-4 md:p-8">
      <Clients 
        business={activeBusiness} 
        onAddClient={handleAddClient} 
        onRecordPayment={handleRecordPayment} 
      />
    </div>
  );
};