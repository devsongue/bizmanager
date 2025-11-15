"use client";

import React from 'react';
import { Sales } from '@/components/sales/Sales';
import { useCreateSale } from '@/hooks/useSale';
import { useActiveBusiness } from '@/contexts/ActiveBusinessContext';
import type { Business } from '@/types';

interface SalesContentProps {
  activeBusiness?: Business;
}

export const SalesContent: React.FC<SalesContentProps> = ({ activeBusiness }) => {
  const { mutateAsync: createSale } = useCreateSale();
  
  // Use context if no prop is provided (for backward compatibility)
  const { activeBusiness: contextBusiness } = useActiveBusiness();
  const business = activeBusiness || contextBusiness;
  
  if (!business) {
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
    <Sales business={business} onAddSale={handleAddSale} />
  );
};