"use client";

import React from 'react';
import { Settings } from '@/components/settings/Settings';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBusinesses } from '@/hooks/useBusiness';

export default function SettingsPage() {
  const { data: businesses = [], isLoading: isBusinessesLoading } = useBusinesses();
  
  if (isBusinessesLoading) {
    return <div className="flex justify-center items-center h-64">Chargement des paramètres...</div>;
  }

  const handleAddBusiness = async (newBusiness: any) => {
    // Implementation would go here
    console.log('Adding business:', newBusiness);
  };
  
  const handleUpdateBusiness = async (updatedBusiness: any) => {
    // Implementation would go here
    console.log('Updating business:', updatedBusiness);
  };
  
  const handleDeleteBusiness = async (businessId: string) => {
    // Implementation would go here
    console.log('Deleting business:', businessId);
  };

  return (
    <MainLayout businesses={businesses}>
      <div className="p-4 md:p-8">
        <Settings 
          businesses={businesses} 
          onAddBusiness={handleAddBusiness}
          onUpdateBusiness={handleUpdateBusiness}
          onDeleteBusiness={handleDeleteBusiness} 
        />
      </div>
    </MainLayout>
  );
}