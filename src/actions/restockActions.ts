"use server";

import { prisma } from '@/lib/prisma';
import { Product } from '@/types';

// Restock a product and update cost information
export async function restockProduct(id: string, quantity: number, totalCost: number, supplierId?: string) {
  try {
    // First, get the current product to check its current stock and cost information
    const currentProduct = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!currentProduct) {
      return { success: false, error: 'Product not found' };
    }
    
    // Calculate the unit cost of the new stock
    const newUnitCost = totalCost / quantity;
    
    // Calculate the new weighted average unit cost
    const currentTotalUnits = currentProduct.stock;
    const currentTotalValue = currentProduct.wholesalePrice * currentTotalUnits; // Current total value based on wholesale price
    const newTotalUnits = currentTotalUnits + quantity;
    const newTotalValue = currentTotalValue + totalCost;
    const newWeightedAverageUnitCost = newTotalUnits > 0 ? newTotalValue / newTotalUnits : 0;
    
    // Prepare update data
    const updateData: any = {
      stock: newTotalUnits,
      // Update the wholesale price to reflect the new weighted average cost
      wholesalePrice: Math.round(newWeightedAverageUnitCost)
    };
    
    // If supplierId is provided, update the supplier information
    if (supplierId) {
      // Get the supplier name
      const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId },
      });
      
      if (supplier) {
        updateData.supplierId = supplierId;
        updateData.supplierName = supplier.name;
      }
    }
    
    // Update the product stock and potentially the wholesale price based on new weighted average cost
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });
    
    // Log the restocking details
    console.log(`Restocked product ${updatedProduct.name}: 
      - Added ${quantity} units at ${newUnitCost.toFixed(2)} FCFA/unit 
      - New total stock: ${newTotalUnits} units
      - New weighted average unit cost: ${newWeightedAverageUnitCost.toFixed(2)} FCFA
      - Updated wholesale price: ${updatedProduct.wholesalePrice} FCFA
      ${supplierId ? `- Supplier: ${updateData.supplierName || 'Unknown'}` : ''}`);
    
    return { success: true, data: updatedProduct };
  } catch (error) {
    console.error('Error restocking product:', error);
    return { success: false, error: 'Failed to restock product' };
  }
}