"use client";

import React from 'react';
import { Clients } from '@/components/clients/Clients';
import { useCreateClient } from '@/hooks/useClient';
import { useActiveBusiness } from '@/contexts/ActiveBusinessContext';
import type { Business } from '@/types';

interface ClientsContentProps {
  activeBusiness?: Business;
}

export const ClientsContent: React.FC<ClientsContentProps> = ({ activeBusiness }) => {
  const { mutateAsync: createClient } = useCreateClient();
  
  // Use context if no prop is provided (for backward compatibility)
  const { activeBusiness: contextBusiness } = useActiveBusiness();
  const business = activeBusiness || contextBusiness;
  
  if (!business) {
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
    <Clients 
      business={business} 
      onAddClient={handleAddClient} 
      onRecordPayment={handleRecordPayment} 
    />
  );
};