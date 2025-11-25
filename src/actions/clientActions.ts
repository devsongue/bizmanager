"use server";

import { prisma } from '@/lib/prisma';
import { Client } from '@/types';

// Fetch clients for a business
export async function getClients(businessId: string) {
  try {
    const clients = await prisma.client.findMany({
      where: { businessId },
    });
    
    return { success: true, data: clients };
  } catch (error) {
    console.error('Error fetching clients:', error);
    return { success: false, error: 'Failed to fetch clients' };
  }
}

// Create a new client
export async function createClient(businessId: string, clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) {
  try {
    const client = await prisma.client.create({
      data: {
        id: `client-${Date.now()}`,
        name: clientData.name,
        contact: clientData.contact,
        telephone: clientData.telephone,
        balance: clientData.balance,
        email: clientData.email,
        address: clientData.address,
        company: clientData.company,
        businessId: businessId,
      },
    });
    
    return { success: true, data: client };
  } catch (error) {
    console.error('Error creating client:', error);
    return { success: false, error: 'Failed to create client' };
  }
}

// Update a client
export async function updateClient(id: string, clientData: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>) {
  try {
    const client = await prisma.client.update({
      where: { id },
      data: clientData,
    });
    
    return { success: true, data: client };
  } catch (error) {
    console.error('Error updating client:', error);
    return { success: false, error: 'Failed to update client' };
  }
}

// Delete a client
export async function deleteClient(id: string) {
  try {
    await prisma.client.delete({
      where: { id },
    });
    
    return { success: true, message: 'Client deleted successfully' };
  } catch (error) {
    console.error('Error deleting client:', error);
    return { success: false, error: 'Failed to delete client' };
  }
}

// Recalculate client balance based on sales and payments
export async function recalculateClientBalance(clientId: string) {
  try {
    // Get all sales for this client
    const sales = await prisma.sale.findMany({
      where: { clientId: clientId },
    });

    // Calculate total sales amount
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);

    // In a more advanced system, you would also factor in separate payment records
    // For now, we'll assume all sales contribute to the balance (as debts)
    
    // Update client balance
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        balance: totalSales,
        lastPurchaseDate: sales.length > 0 ? new Date() : undefined
      },
    });

    return { success: true, data: updatedClient };
  } catch (error) {
    console.error('Error recalculating client balance:', error);
    return { success: false, error: 'Failed to recalculate client balance' };
  }
}
