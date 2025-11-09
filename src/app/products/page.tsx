"use client";

import React from 'react';
import { Products } from '@/components/products/Products';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBusinesses } from '@/hooks/useBusiness';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProduct';
import { useAuth } from '@/contexts/AuthContext';

export default function ProductsPage() {
  const { data: businesses = [], isLoading: isBusinessesLoading } = useBusinesses();
  const { mutateAsync: createProduct } = useCreateProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const { currentUser } = useAuth();
  
  if (isBusinessesLoading) {
    return <div className="flex justify-center items-center h-64">Chargement des produits...</div>;
  }
  
  return (
    <MainLayout businesses={businesses}>
      <ProductsPageContent 
        businesses={businesses} 
        createProduct={createProduct} 
        updateProduct={updateProduct} 
        currentUser={currentUser} 
      />
    </MainLayout>
  );
}

// Composant séparé pour le contenu de la page
const ProductsPageContent = ({ 
  businesses, 
  createProduct, 
  updateProduct, 
  currentUser 
}: { 
  businesses: any[]; 
  createProduct: any; 
  updateProduct: any; 
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
  
  const handleAddProduct = async (newProduct: any) => {
    try {
      await createProduct(newProduct);
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };
  
  const handleUpdateProduct = async (updatedProduct: any) => {
    try {
      await updateProduct(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Products 
        business={activeBusiness} 
        onAddProduct={handleAddProduct} 
        onUpdateProduct={handleUpdateProduct} 
      />
    </div>
  );
};