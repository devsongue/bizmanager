"use server";

import { prisma } from '@/lib/prisma';
import { Business } from '@/types';

// Helper function to convert Prisma model to TypeScript interface
function serializeBusinessData(business: any): Business {
  return {
    id: business.id,
    name: business.name,
    type: business.type,
    sales: business.sales.map((sale: any) => ({
      id: sale.id,
      date: sale.date instanceof Date ? sale.date.toISOString() : sale.date,
      clientId: sale.clientId,
      clientName: sale.clientName,
      productId: sale.productId,
      productName: sale.productName,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      total: sale.total,
      saleType: sale.saleType,
      businessId: sale.businessId,
    })),
    expenses: business.expenses.map((expense: any) => ({
      id: expense.id,
      date: expense.date instanceof Date ? expense.date.toISOString() : expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
    })),
    products: business.products,
    clients: business.clients,
    suppliers: business.suppliers,
  };
}

// Fetch all businesses
export async function getBusinesses() {
  try {
    const businesses = await prisma.business.findMany({
      include: {
        sales: true,
        expenses: true,
        products: true,
        clients: true,
        suppliers: true,
      },
    });
    
    // Convert Date objects to strings
    const serializedBusinesses = businesses.map(serializeBusinessData);
    
    return { success: true, data: serializedBusinesses };
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return { success: false, error: 'Failed to fetch businesses' };
  }
}

// Create a new business
export async function createBusiness(businessData: Omit<Business, 'id' | 'sales' | 'expenses' | 'products' | 'clients' | 'suppliers'>) {
  try {
    const business = await prisma.business.create({
      data: {
        id: `biz-${Date.now()}`,
        name: businessData.name,
        type: businessData.type,
      },
    });
    
    return { success: true, data: business };
  } catch (error) {
    console.error('Error creating business:', error);
    return { success: false, error: 'Failed to create business' };
  }
}

// Update a business (only basic fields, not relations)
export async function updateBusiness(id: string, businessData: Partial<Omit<Business, 'id' | 'sales' | 'expenses' | 'products' | 'clients' | 'suppliers'>>) {
  try {
    const business = await prisma.business.update({
      where: { id },
      data: businessData,
    });
    
    return { success: true, data: business };
  } catch (error) {
    console.error('Error updating business:', error);
    return { success: false, error: 'Failed to update business' };
  }
}

// Delete a business
export async function deleteBusiness(id: string) {
  try {
    await prisma.business.delete({
      where: { id },
    });
    
    return { success: true, message: 'Business deleted successfully' };
  } catch (error) {
    console.error('Error deleting business:', error);
    return { success: false, error: 'Failed to delete business' };
  }
}