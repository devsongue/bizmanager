"use server";

import { prisma } from '@/lib/prisma';
import { Payment } from '@/types';

// Fetch payment history for a client
export async function getClientPayments(clientId: string) {
  try {
    // Get all sales for this client to build payment history
    const sales = await prisma.sale.findMany({
      where: { 
        clientId: clientId,
        paymentStatus: 'PAID'
      },
      orderBy: { date: 'desc' },
    });

    // Transform sales into payment objects
    const payments: Payment[] = sales.map(sale => ({
      id: sale.id,
      date: sale.date.toISOString(),
      amount: sale.total,
      method: sale.paymentMethod,
      type: 'PAYMENT',
      description: `Paiement pour la vente ${sale.reference}`,
      saleReference: sale.reference,
      clientId: sale.clientId || ''
    }));

    return { success: true, data: payments };
  } catch (error) {
    console.error('Error fetching client payments:', error);
    return { success: false, error: 'Failed to fetch client payments' };
  }
}

// Fetch all payments for a business (for admin view)
export async function getBusinessPayments(businessId: string) {
  try {
    // Get all sales for this business
    const sales = await prisma.sale.findMany({
      where: { 
        businessId: businessId,
        paymentStatus: 'PAID'
      },
      orderBy: { date: 'desc' },
      include: {
        client: true
      }
    });

    // Transform sales into payment objects
    const payments: Payment[] = sales.map(sale => ({
      id: sale.id,
      date: sale.date.toISOString(),
      amount: sale.total,
      method: sale.paymentMethod,
      type: 'PAYMENT',
      description: `Paiement de ${sale.client?.name || 'Client'} pour la vente ${sale.reference}`,
      saleReference: sale.reference,
      clientId: sale.clientId || ''
    }));

    return { success: true, data: payments };
  } catch (error) {
    console.error('Error fetching business payments:', error);
    return { success: false, error: 'Failed to fetch business payments' };
  }
}