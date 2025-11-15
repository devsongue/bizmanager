"use client";

import React from 'react';
import { Products } from '@/components/products/Products';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProduct';
import { useActiveBusiness } from '@/contexts/ActiveBusinessContext';
import type { Business } from '@/types';

interface ProductsContentProps {
  activeBusiness?: Business;
}

export const ProductsContent: React.FC<ProductsContentProps> = ({ activeBusiness }) => {
  const { mutateAsync: createProduct } = useCreateProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  
  // Use context if no prop is provided (for backward compatibility)
  const { activeBusiness: contextBusiness } = useActiveBusiness();
  const business = activeBusiness || contextBusiness;
  
  if (!business) {
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
    <Products 
      business={business} 
      onAddProduct={handleAddProduct} 
      onUpdateProduct={handleUpdateProduct} 
    />
  );
};