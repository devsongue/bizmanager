"use server";

import { prisma } from '@/lib/prisma';
import { Sale } from '@/types';
import { headers } from 'next/headers';
import { recalculateClientBalance } from './clientActions';

// Fetch sales for a business
export async function getSales(businessId: string) {
  try {
    const sales = await prisma.sale.findMany({
      where: { businessId },
      orderBy: { date: 'desc' },
    });
    
    return { success: true, data: sales };
  } catch (error) {
    console.error('Error fetching sales:', error);
    return { success: false, error: 'Failed to fetch sales' };
  }
}

// Create a new sale
export async function createSale(businessId: string, saleData: Omit<Sale, 'id' | 'reference' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'businessId'>) {
  try {
    // Generate a unique reference
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const reference = `SL${date}${random}`;
    
    // Get product to calculate profit
    let profit = 0;
    if (saleData.productId) {
      const product = await prisma.product.findUnique({
        where: { id: saleData.productId }
      });
      
      if (product) {
        const costPrice = product.costPrice > 0 ? product.costPrice : product.wholesalePrice;
        const totalCost = costPrice * saleData.quantity;
        profit = saleData.total - totalCost;
      }
    }
    
    const sale = await prisma.sale.create({
      data: {
        id: `sale-${Date.now()}`,
        reference: reference,
        date: new Date(saleData.date),
        clientId: saleData.clientId,
        productId: saleData.productId,
        productName: saleData.productName,
        quantity: saleData.quantity,
        unitPrice: saleData.unitPrice,
        discount: saleData.discount || 0,
        tax: saleData.tax || 0,
        total: saleData.total,
        profit: profit,
        saleType: saleData.saleType,
        paymentStatus: saleData.paymentStatus,
        paymentMethod: saleData.paymentMethod,
        businessId: businessId,
        userId: saleData.userId,
      },
    });
    
    // Recalculate client balance if a client is associated with the sale
    if (saleData.clientId) {
      await recalculateClientBalance(saleData.clientId);
    }
    
    return { success: true, data: sale };
  } catch (error) {
    console.error('Error creating sale:', error);
    return { success: false, error: 'Failed to create sale' };
  }
}

// Update a sale
export async function updateSale(id: string, saleData: Partial<Omit<Sale, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>) {
  try {
    // Vérifier les autorisations - seul un admin peut modifier une vente
    const headersList = await headers();
    const userRole = headersList.get('x-user-role');
    
    if (userRole !== 'ADMIN') {
      return { success: false, error: 'Seuls les administrateurs peuvent modifier les ventes' };
    }
    
    const sale = await prisma.sale.update({
      where: { id },
      data: saleData,
    });
    
    // Recalculate client balance if client is associated with the sale
    if (saleData.clientId) {
      await recalculateClientBalance(saleData.clientId);
    }
    
    return { success: true, data: sale };
  } catch (error) {
    console.error('Error updating sale:', error);
    return { success: false, error: 'Failed to update sale' };
  }
}

// Delete a sale
export async function deleteSale(id: string) {
  try {
    // Vérifier les autorisations - seul un admin peut supprimer une vente
    const headersList = await headers();
    const userRole = headersList.get('x-user-role');
    
    if (userRole !== 'ADMIN') {
      return { success: false, error: 'Seuls les administrateurs peuvent supprimer les ventes' };
    }
    
    // Get the sale before deleting to recalculate client balance
    const sale = await prisma.sale.findUnique({
      where: { id }
    });
    
    await prisma.sale.delete({
      where: { id },
    });
    
    // Recalculate client balance if client was associated with the sale
    if (sale && sale.clientId) {
      await recalculateClientBalance(sale.clientId);
    }
    
    return { success: true, message: 'Sale deleted successfully' };
  } catch (error) {
    console.error('Error deleting sale:', error);
    return { success: false, error: 'Failed to delete sale' };
  }
}