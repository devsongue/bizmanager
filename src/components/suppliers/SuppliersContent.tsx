"use client";

import React from 'react';
import { Suppliers } from '@/components/suppliers/Suppliers';
import { useCreateSupplier } from '@/hooks/useSupplier';
import { useActiveBusiness } from '@/contexts/ActiveBusinessContext';
import type { Business } from '@/types';

interface SuppliersContentProps {
  activeBusiness?: Business;
}

export const SuppliersContent: React.FC<SuppliersContentProps> = ({ activeBusiness }) => {
  const { mutateAsync: createSupplier } = useCreateSupplier();
  
  // Use context if no prop is provided (for backward compatibility)
  const { activeBusiness: contextBusiness } = useActiveBusiness();
  const business = activeBusiness || contextBusiness;
  
  if (!business) {
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
    <Suppliers business={business} onAddSupplier={handleAddSupplier} />
  );
};