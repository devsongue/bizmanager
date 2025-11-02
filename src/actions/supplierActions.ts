"use server";

import { prisma } from '@/lib/prisma';
import { Supplier } from '@/types';

// Fetch suppliers for a business
export async function getSuppliers(businessId: string) {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { businessId },
    });
    
    return { success: true, data: suppliers };
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return { success: false, error: 'Failed to fetch suppliers' };
  }
}

// Create a new supplier
export async function createSupplier(businessId: string, supplierData: Omit<Supplier, 'id'>) {
  try {
    const supplier = await prisma.supplier.create({
      data: {
        id: `sup-${Date.now()}`,
        name: supplierData.name,
        product: supplierData.product,
        business: {
          connect: { id: businessId },
        },
      },
    });
    
    return { success: true, data: supplier };
  } catch (error) {
    console.error('Error creating supplier:', error);
    return { success: false, error: 'Failed to create supplier' };
  }
}

// Update a supplier
export async function updateSupplier(id: string, supplierData: Partial<Supplier>) {
  try {
    const supplier = await prisma.supplier.update({
      where: { id },
      data: supplierData,
    });
    
    return { success: true, data: supplier };
  } catch (error) {
    console.error('Error updating supplier:', error);
    return { success: false, error: 'Failed to update supplier' };
  }
}

// Delete a supplier
export async function deleteSupplier(id: string) {
  try {
    await prisma.supplier.delete({
      where: { id },
    });
    
    return { success: true, message: 'Supplier deleted successfully' };
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return { success: false, error: 'Failed to delete supplier' };
  }
}