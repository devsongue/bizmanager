"use server";

import { prisma } from '@/lib/prisma';
import { Business, Sale, Expense, Product, Client, Supplier } from '@/types';

// Serialize business data for client-side use
// Convert Date objects to strings for JSON serialization
function serializeBusinessData(business: any): Business {
  return {
    id: business.id,
    name: business.name,
    type: business.type,
    description: business.description ?? undefined,
    address: business.address ?? undefined,
    city: business.city ?? undefined,
    country: business.country ?? undefined,
    phone: business.phone ?? undefined,
    email: business.email ?? undefined,
    website: business.website ?? undefined,
    logoUrl: business.logoUrl ?? undefined,
    currency: business.currency ?? undefined,
    taxRate: business.taxRate ?? undefined,
    timezone: business.timezone ?? undefined,
    language: business.language ?? undefined,
    dateFormat: business.dateFormat ?? undefined,
    settings: business.settings,
    sales: business.sales.map((sale: any) => ({
      id: sale.id,
      reference: sale.reference,
      date: sale.date,
      clientId: sale.clientId ?? undefined,
      clientName: sale.clientName ?? undefined,
      productId: sale.productId ?? undefined,
      productName: sale.productName,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      discount: sale.discount,
      tax: sale.tax,
      total: sale.total,
      profit: sale.profit,
      saleType: sale.saleType,
      paymentStatus: sale.paymentStatus,
      paymentMethod: sale.paymentMethod,
      businessId: sale.businessId,
      userId: sale.userId ?? undefined,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
      deletedAt: sale.deletedAt ? sale.deletedAt : undefined,
    })),
    expenses: business.expenses.map((expense: any) => ({
      id: expense.id,
      reference: expense.reference ?? undefined,
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      paymentMethod: expense.paymentMethod,
      receiptUrl: expense.receiptUrl ?? undefined,
      approvedById: expense.approvedById ?? undefined,
      businessId: expense.businessId,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
      deletedAt: expense.deletedAt ? expense.deletedAt : undefined,
    })),
    products: business.products.map((product: any) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      sku: product.sku ?? undefined,
      barcode: product.barcode ?? undefined,
      stock: product.stock,
      minStock: product.minStock,
      costPrice: product.costPrice,
      retailPrice: product.retailPrice,
      wholesalePrice: product.wholesalePrice,
      images: product.images ?? undefined,
      supplierId: product.supplierId ?? undefined,
      businessId: product.businessId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt ? product.deletedAt : undefined,
    })),
    clients: business.clients.map((client: any) => ({
      id: client.id,
      name: client.name,
      contact: client.contact,
      telephone: client.telephone ?? undefined,
      balance: client.balance,
      email: client.email ?? undefined,
      address: client.address ?? undefined,
      company: client.company ?? undefined,
      notes: client.notes ?? undefined,
      loyaltyPoints: client.loyaltyPoints,
      lastPurchaseDate: client.lastPurchaseDate ? client.lastPurchaseDate : undefined,
      businessId: client.businessId,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      deletedAt: client.deletedAt ? client.deletedAt : undefined,
    })),
    suppliers: business.suppliers.map((supplier: any) => ({
      id: supplier.id,
      name: supplier.name,
      product: supplier.product,
      contacts: supplier.contacts ?? undefined,
      email: supplier.email ?? undefined,
      telephone: supplier.telephone ?? undefined,
      address: supplier.address ?? undefined,
      description: supplier.description ?? undefined,
      productTypes: supplier.productTypes ?? undefined,
      rating: supplier.rating ?? undefined,
      notes: supplier.notes ?? undefined,
      businessId: supplier.businessId,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
      deletedAt: supplier.deletedAt ? supplier.deletedAt : undefined,
    })),
    createdAt: business.createdAt,
    updatedAt: business.updatedAt,
    deletedAt: business.deletedAt ? business.deletedAt : undefined,
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

// Fetch a single business by ID with all related data
export async function getBusinessById(id: string) {
  try {
    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        sales: true,
        expenses: true,
        products: true,
        clients: true,
        suppliers: true,
      },
    });
    
    if (!business) {
      return { success: false, error: 'Business not found' };
    }
    
    // Convert Date objects to strings
    const serializedBusiness = serializeBusinessData(business);
    
    return { success: true, data: serializedBusiness };
  } catch (error) {
    console.error('Error fetching business:', error);
    return { success: false, error: 'Failed to fetch business' };
  }
}

// Create a new business
export async function createBusiness(businessData: Omit<Business, 'id' | 'sales' | 'expenses' | 'products' | 'clients' | 'suppliers' | 'createdAt' | 'updatedAt' | 'deletedAt'>) {
  try {
    const business = await prisma.business.create({
      data: {
        id: `biz-${Date.now()}`,
        name: businessData.name,
        type: businessData.type,
        country: businessData.country,
        city: businessData.city,
        currency: businessData.currency,
        logoUrl: businessData.logoUrl,
        settings: businessData.settings ? JSON.parse(JSON.stringify(businessData.settings)) : undefined,
      },
    });
    
    return { success: true, data: business };
  } catch (error) {
    console.error('Error creating business:', error);
    return { success: false, error: 'Failed to create business' };
  }
}

// Update a business (only basic fields, not relations)
export async function updateBusiness(id: string, businessData: Partial<Omit<Business, 'id' | 'sales' | 'expenses' | 'products' | 'clients' | 'suppliers' | 'createdAt' | 'updatedAt' | 'deletedAt'>>) {
  try {
    const business = await prisma.business.update({
      where: { id },
      data: {
        name: businessData.name,
        type: businessData.type,
        country: businessData.country,
        city: businessData.city,
        currency: businessData.currency,
        logoUrl: businessData.logoUrl,
        settings: businessData.settings ? JSON.parse(JSON.stringify(businessData.settings)) : undefined,
      },
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