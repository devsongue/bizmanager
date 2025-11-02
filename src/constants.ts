import type { User, Business } from './types';

// Date filter constants
export const DATE_FILTERS = {
    TODAY: 'today',
    THIS_WEEK: 'this_week',
    THIS_MONTH: 'this_month',
    THIS_YEAR: 'this_year',
    LAST_7_DAYS: 'last_7_days',
    LAST_30_DAYS: 'last_30_days',
    LAST_90_DAYS: 'last_90_days',
    CUSTOM: 'custom'
};

export const getDateRange = (filter: string) => {
    const today = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (filter) {
        case DATE_FILTERS.TODAY:
            return { start: today.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
        case DATE_FILTERS.THIS_WEEK:
            startDate.setDate(today.getDate() - today.getDay());
            endDate.setDate(today.getDate() + (6 - today.getDay()));
            return { 
                start: startDate.toISOString().split('T')[0], 
                end: endDate.toISOString().split('T')[0] 
            };
        case DATE_FILTERS.THIS_MONTH:
            startDate.setDate(1);
            endDate.setMonth(today.getMonth() + 1, 0);
            return { 
                start: startDate.toISOString().split('T')[0], 
                end: endDate.toISOString().split('T')[0] 
            };
        case DATE_FILTERS.THIS_YEAR:
            startDate.setMonth(0, 1);
            endDate.setMonth(11, 31);
            return { 
                start: startDate.toISOString().split('T')[0], 
                end: endDate.toISOString().split('T')[0] 
            };
        case DATE_FILTERS.LAST_7_DAYS:
            startDate.setDate(today.getDate() - 6);
            return { 
                start: startDate.toISOString().split('T')[0], 
                end: today.toISOString().split('T')[0] 
            };
        case DATE_FILTERS.LAST_30_DAYS:
            startDate.setDate(today.getDate() - 29);
            return { 
                start: startDate.toISOString().split('T')[0], 
                end: today.toISOString().split('T')[0] 
            };
        case DATE_FILTERS.LAST_90_DAYS:
            startDate.setDate(today.getDate() - 89);
            return { 
                start: startDate.toISOString().split('T')[0], 
                end: today.toISOString().split('T')[0] 
            };
        default:
            return { start: '', end: '' };
    }
};

export const mockUsers: User[] = [
    {
        id: 'user-1',
        name: 'Admin Principal',
        email: 'admin@bizsuite.com',
        password: 'password123',
        role: 'Admin',
        avatarUrl: 'https://i.pravatar.cc/150?u=admin',
    },
    {
        id: 'user-2',
        name: 'Jean Gérant',
        email: 'jean@bizsuite.com',
        password: 'password123',
        role: 'Gérant',
        avatarUrl: 'https://i.pravatar.cc/150?u=gerant',
        managedBusinessIds: ['biz-1'],
    },
];

export const mockBusinesses: Business[] = [
    {
        id: 'biz-1',
        name: 'Boutique Chez Jean',
        type: 'Commerce de détail',
        sales: [
            { id: 'sale-1', date: '2023-10-26', clientId: 'client-1', clientName: 'Alice Dubois', productId: 'prod-1', productName: 'Savon', quantity: 10, unitPrice: 500, total: 5000, saleType: 'Vente en gros' },
            { id: 'sale-2', date: '2023-10-25', clientId: 'client-2', clientName: 'Bob Martin', productId: 'prod-2', productName: 'Huile', quantity: 5, unitPrice: 1500, total: 7500, saleType: 'Vente au détail' },
            { id: 'sale-3', date: '2023-09-15', clientId: 'client-1', clientName: 'Alice Dubois', productId: 'prod-3', productName: 'Riz 5kg', quantity: 2, unitPrice: 3500, total: 7000, saleType: 'Vente au détail' },
        ],
        expenses: [
            { id: 'exp-1', date: '2023-10-20', category: 'Salaire', description: 'Salaire employé', amount: 75000 },
            { id: 'exp-2', date: '2023-10-15', category: 'Services publics', description: 'Facture électricité', amount: 15000 },
             { id: 'exp-3', date: '2023-09-10', category: 'Recharge', description: 'Achat de crédit', amount: 10000 },
        ],
        products: [
            { id: 'prod-1', name: 'Savon', category: 'Hygiène', stock: 100, retailPrice: 550, wholesalePrice: 500 },
            { id: 'prod-2', name: 'Huile', category: 'Alimentation', stock: 8, retailPrice: 1500, wholesalePrice: 1400 },
            { id: 'prod-3', name: 'Riz 5kg', category: 'Alimentation', stock: 80, retailPrice: 3500, wholesalePrice: 3300 },
            { id: 'prod-4', name: 'Lait en poudre', category: 'Alimentation', stock: 5, retailPrice: 2000, wholesalePrice: 1800 },
        ],
        clients: [
            { id: 'client-1', name: 'Alice Dubois', contact: '771234567', balance: -12000 }, // Updated balance
            { id: 'client-2', name: 'Bob Martin', contact: '781234567', balance: 2500 }, // Updated balance
        ],
        suppliers: [
            { id: 'sup-1', name: 'Grossiste Dakar', product: 'Produits alimentaires' },
            { id: 'sup-2', name: 'Savonnerie du coin', product: 'Savons et détergents' },
        ]
    },
    {
        id: 'biz-2',
        name: 'Presta Services SARL',
        type: 'Fourniture de services',
        sales: [
             { id: 'sale-b2-1', date: '2023-10-22', clientId: 'client-b2-1', clientName: 'Entreprise A', productId: 'prod-b2-1', productName: 'Maintenance Informatique', quantity: 1, unitPrice: 150000, total: 150000, saleType: 'Vente au détail' },
        ],
        expenses: [
            { id: 'exp-b2-1', date: '2023-10-05', category: 'Loyer', description: 'Loyer bureau Octobre', amount: 200000 },
        ],
        products: [
            { id: 'prod-b2-1', name: 'Maintenance Informatique', category: 'Service', stock: 999, retailPrice: 150000, wholesalePrice: 150000 },
        ],
        clients: [
            { id: 'client-b2-1', name: 'Entreprise A', contact: '338000000', balance: -150000 }, // Updated balance
        ],
        suppliers: [
            { id: 'sup-b2-1', name: 'Papeterie Pro', product: 'Fournitures de bureau' },
        ]
    }
];