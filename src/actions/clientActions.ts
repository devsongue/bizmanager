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
export async function createClient(businessId: string, clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const client = await prisma.client.create({
      data: {
        id: `client-${Date.now()}`,
        name: clientData.name,
        contact: clientData.contact,
        telephone: clientData.telephone,  // Ajout du champ
        balance: clientData.balance,
        email: clientData.email,
        address: clientData.address,
        company: clientData.company,
        business: {
          connect: { id: businessId },
        },
      },
    });
    
    return { success: true, data: client };
  } catch (error) {
    console.error('Error creating client:', error);
    return { success: false, error: 'Failed to create client' };
  }
}

// Update a client
export async function updateClient(id: string, clientData: Partial<Client>) {
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