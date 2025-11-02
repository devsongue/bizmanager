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
    supplierId?: string;
    supplierName?: string;
}

export interface Client {
    id: string;
    name: string;
    contact: string;
    balance: number;
}

export interface Supplier {
    id: string;
    name: string;
    product: string;
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