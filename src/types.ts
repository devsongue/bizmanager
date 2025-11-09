export interface Sale {
    id: string;
    date: string;
    clientId: string;
    clientName: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
    saleType: 'Vente au détail' | 'Vente en gros';
}

export interface Expense {
    id: string;
    date: string;
    category: string;
    description: string;
    amount: number;
}

export interface Product {
    id: string;
    name: string;
    category: string;
    stock: number;
    retailPrice: number;
    wholesalePrice: number;
    supplierId?: string | null;
    supplierName?: string | null;
}

export interface Client {
    id: string;
    name: string;
    contact: string;
    telephone?: string | null;  // Ajout du champ numéro de téléphone
    balance: number;
    email?: string | null;  // Match Prisma type
    address?: string | null;  // Match Prisma type
    company?: string | null;  // Match Prisma type
    // businessId is managed by Prisma relation, not needed in client interface
    createdAt?: Date;  // Match Prisma type
    updatedAt?: Date;  // Match Prisma type
}

export interface Supplier {
    id: string;
    name: string;
    product: string;
    contacts?: string | null;  // Match Prisma type
    description?: string | null;  // Match Prisma type
    productTypes?: string | null;  // Match Prisma type
    // businessId is managed by Prisma relation, not needed in client interface
    createdAt?: Date;  // Match Prisma type
    updatedAt?: Date;  // Match Prisma type
}

export interface Business {
    id: string;
    name: string;
    type: string;
    sales: Sale[];
    expenses: Expense[];
    products: Product[];
    clients: Client[];
    suppliers: Supplier[];
}

// Updated User interface to match Prisma schema
export interface User {
    id: string;
    name: string;
    email: string;
    password?: string | null;
    role: string;
    avatarUrl: string;
    managedBusinessIds?: string[];
}

// Session token payload
export interface SessionPayload {
    userId: string;
    email: string;
    role: string;
}

// Add result types for our actions
export type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };