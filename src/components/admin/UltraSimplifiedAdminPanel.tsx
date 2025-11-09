"use client";

import React, { useState } from 'react';
import type { Business, User, Sale, Expense } from '@/types';
import { ProductList } from './ProductList';

interface UltraSimplifiedAdminPanelProps {
    allBusinesses: Business[];
    allUsers: User[];
}

// Helper function to calculate total sales revenue
const calculateTotalSalesRevenue = (sales: Sale[]): number => {
    return sales.reduce((sum, sale) => sum + sale.total, 0);
};

// Helper function to calculate total expenses
const calculateTotalExpenses = (expenses: Expense[]): number => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
    return `${amount?.toLocaleString('fr-FR')} FCFA`;
};

export const UltraSimplifiedAdminPanel: React.FC<UltraSimplifiedAdminPanelProps> = ({ allBusinesses, allUsers }) => {
    const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
    const [reportPeriod, setReportPeriod] = useState<'all' | 'month' | 'quarter' | 'year'>('all');
    const [adminView, setAdminView] = useState<'overview' | 'businesses' | 'users' | 'products'>('overview');
    const [businessSortConfig, setBusinessSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
    const [userSortConfig, setUserSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

    // Get selected business details
    const selectedBusiness = selectedBusinessId
        ? allBusinesses.find((b: any) => b.id === selectedBusinessId)
        : null;

    // Get all products from all businesses or selected business
    const getAllProducts = (): any[] => {
        if (selectedBusiness) {
            return selectedBusiness.products;
        }

        // Flatten products from all businesses and add business name
        return allBusinesses.flatMap((business: any) =>
            business.products.map((product: any) => ({
                ...product,
                businessName: business.name
            }))
        );
    };

    // Calculate simplified statistics with period filtering
    const totalBusinesses = allBusinesses.length;
    const totalUsersCount = allUsers.length;
    
    // Calculate financial totals with period filtering
    const calculatePeriodFilteredData = () => {
        let totalRevenue = 0;
        let totalExpensesAmount = 0;
        let totalProducts = 0;
        
        allBusinesses.forEach((business: Business) => {
            let filteredSales = business.sales;
            let filteredExpenses = business.expenses;
            
            if (reportPeriod !== 'all') {
                filteredSales = filterByPeriod(business.sales, 'date');
                filteredExpenses = filterByPeriod(business.expenses, 'date');
            }
            
            totalRevenue += calculateTotalSalesRevenue(filteredSales);
            totalExpensesAmount += calculateTotalExpenses(filteredExpenses);
            totalProducts += business.products.length;
        });
        
        return { totalRevenue, totalExpensesAmount, totalProducts };
    };
    
    const { totalRevenue, totalExpensesAmount, totalProducts } = calculatePeriodFilteredData();
    const netProfit = totalRevenue - totalExpensesAmount;

    // Filter data based on selected period with improved precision
    const filterByPeriod = (items: any[], dateField: string): any[] => {
        if (reportPeriod === 'all') return items;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        const filteredItems = items.filter(item => {
            const itemDate = new Date(item[dateField]);
            const itemYear = itemDate.getFullYear();
            const itemMonth = itemDate.getMonth();

            switch (reportPeriod) {
                case 'month':
                    return itemYear === currentYear && itemMonth === currentMonth;
                case 'quarter':
                    const currentQuarter = Math.floor(currentMonth / 3);
                    const itemQuarter = Math.floor(itemMonth / 3);
                    return itemYear === currentYear && itemQuarter === currentQuarter;
                case 'year':
                    return itemYear === currentYear;
                default:
                    return true;
            }
        });

        return filteredItems;
    };

    // Get top performing businesses with improved sorting and period filtering
    const getTopPerformingBusinesses = (): any[] => {
        return [...allBusinesses]
            .map((business: any) => {
                // Filter sales and expenses by selected period
                let filteredSales = business.sales;
                let filteredExpenses = business.expenses;
                
                if (reportPeriod !== 'all') {
                    filteredSales = filterByPeriod(business.sales, 'date');
                    filteredExpenses = filterByPeriod(business.expenses, 'date');
                }
                
                const totalRevenue = calculateTotalSalesRevenue(filteredSales);
                const totalExpenses = calculateTotalExpenses(filteredExpenses);
                const netProfit = totalRevenue - totalExpenses;

                return {
                    ...business,
                    totalRevenue,
                    totalExpenses,
                    netProfit
                };
            })
            .sort((a, b) => {
                // Always sort by net profit in descending order for top performing businesses
                return b.netProfit - a.netProfit;
            })
            .slice(0, 3);
    };

    // Get filtered sales for display with improved precision
    const getFilteredSales = (): Sale[] => {
        let allSales: Sale[] = [];

        if (selectedBusiness) {
            allSales = filterByPeriod(selectedBusiness.sales, 'date');
        } else {
            allSales = allBusinesses.flatMap((business: any) =>
                filterByPeriod(business.sales, 'date').map((sale: any) => ({
                    ...sale,
                    businessName: business.name
                }))
            );
        }

        // Sort by date in descending order (most recent first)
        return allSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    // Improved sorting for businesses view
    const getSortedBusinesses = () => {
        const sortableBusinesses = allBusinesses.map((business: any) => {
            const totalRevenue = calculateTotalSalesRevenue(business.sales);
            const totalExpenses = calculateTotalExpenses(business.expenses);
            const netProfit = totalRevenue - totalExpenses;

            return {
                ...business,
                totalRevenue,
                totalExpenses,
                netProfit
            };
        });

        if (businessSortConfig !== null) {
            sortableBusinesses.sort((a, b) => {
                if (a[businessSortConfig.key] < b[businessSortConfig.key]) {
                    return businessSortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[businessSortConfig.key] > b[businessSortConfig.key]) {
                    return businessSortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return sortableBusinesses;
    };

    // Improved sorting for users view
    const getSortedUsers = () => {
        let sortableUsers = [...allUsers];

        if (userSortConfig !== null) {
            sortableUsers.sort((a, b) => {
                let aValue, bValue;
                
                switch (userSortConfig.key) {
                    case 'name':
                        aValue = a.name;
                        bValue = b.name;
                        break;
                    case 'role':
                        aValue = a.role;
                        bValue = b.role;
                        break;
                    case 'businesses':
                        aValue = a.role === 'Admin' ? Infinity : (a.managedBusinessIds ? a.managedBusinessIds.length : 0);
                        bValue = b.role === 'Admin' ? Infinity : (b.managedBusinessIds ? b.managedBusinessIds.length : 0);
                        break;
                    default:
                        return 0;
                }

                if (aValue < bValue) {
                    return userSortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return userSortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return sortableUsers;
    };

    // Handle business table sorting
    const handleBusinessSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (businessSortConfig && businessSortConfig.key === key && businessSortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setBusinessSortConfig({ key, direction });
    };

    // Handle user table sorting
    const handleUserSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (userSortConfig && userSortConfig.key === key && userSortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setUserSortConfig({ key, direction });
    };

    // Render overview view for admin with improved sorting and period filtering
    const renderOverviewView = () => (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg text-center">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Entreprises</h3>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{totalBusinesses}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg text-center">
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Utilisateurs</h3>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-300">{totalUsersCount}</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg text-center">
                    <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">Revenus</h3>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg text-center">
                    <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Bénéfice</h3>
                    <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-yellow-600 dark:text-yellow-300' : 'text-red-600 dark:text-red-300'}`}>
                        {formatCurrency(netProfit)}
                    </p>
                </div>
            </div>

            {/* Top Performing Businesses */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Meilleures Entreprises</h2>
                <div className="space-y-3">
                    {getTopPerformingBusinesses().map((business: any) => (
                        <div key={business.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="font-medium text-gray-800 dark:text-white">{business.name}</span>
                            <span className={`font-bold ${business.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(business.netProfit)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Activité Récente</h2>
                <div className="space-y-3">
                    {getFilteredSales()
                        .slice(0, 3)
                        .map((sale: any, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white">{sale.businessName || (selectedBusiness ? selectedBusiness.name : 'Multiple')}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(sale.date).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                <span className="font-bold text-green-600">
                                    {formatCurrency(sale.total)}
                                </span>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );

    // Render businesses view for admin with improved sorting
    const renderBusinessesView = () => (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th 
                                    scope="col" 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                    onClick={() => handleBusinessSort('name')}
                                >
                                    <div className="flex items-center">
                                        <span>Entreprise</span>
                                        {businessSortConfig && businessSortConfig.key === 'name' && (
                                            <span className="ml-1">
                                                {businessSortConfig.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                    onClick={() => handleBusinessSort('totalRevenue')}
                                >
                                    <div className="flex items-center">
                                        <span>Revenus</span>
                                        {businessSortConfig && businessSortConfig.key === 'totalRevenue' && (
                                            <span className="ml-1">
                                                {businessSortConfig.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                    onClick={() => handleBusinessSort('totalExpenses')}
                                >
                                    <div className="flex items-center">
                                        <span>Dépenses</span>
                                        {businessSortConfig && businessSortConfig.key === 'totalExpenses' && (
                                            <span className="ml-1">
                                                {businessSortConfig.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                    onClick={() => handleBusinessSort('netProfit')}
                                >
                                    <div className="flex items-center">
                                        <span>Bénéfice</span>
                                        {businessSortConfig && businessSortConfig.key === 'netProfit' && (
                                            <span className="ml-1">
                                                {businessSortConfig.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {getSortedBusinesses().map((business: any) => {
                                return (
                                    <tr key={business.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{business.name}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">{formatCurrency(business.totalRevenue)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-medium">{formatCurrency(business.totalExpenses)}</td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${business.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(business.netProfit)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // Render users view for admin with improved sorting
    const renderUsersView = () => (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th 
                                    scope="col" 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                    onClick={() => handleUserSort('name')}
                                >
                                    <div className="flex items-center">
                                        <span>Nom</span>
                                        {userSortConfig && userSortConfig.key === 'name' && (
                                            <span className="ml-1">
                                                {userSortConfig.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                    onClick={() => handleUserSort('role')}
                                >
                                    <div className="flex items-center">
                                        <span>Rôle</span>
                                        {userSortConfig && userSortConfig.key === 'role' && (
                                            <span className="ml-1">
                                                {userSortConfig.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                    onClick={() => handleUserSort('businesses')}
                                >
                                    <div className="flex items-center">
                                        <span>Entreprises</span>
                                        {userSortConfig && userSortConfig.key === 'businesses' && (
                                            <span className="ml-1">
                                                {userSortConfig.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {getSortedUsers().map((user: User) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        <div className="flex items-center">
                                            {user.name}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'Admin'
                                                ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                                                : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {user.role === 'Admin'
                                            ? 'Toutes'
                                            : user.managedBusinessIds
                                                ? `${user.managedBusinessIds.length}`
                                                : 'Aucune'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Administration</h1>
                <div className="flex space-x-2">
                    <select
                        value={reportPeriod}
                        onChange={(e) => setReportPeriod(e.target.value as any)}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">Tout</option>
                        <option value="month">Mois</option>
                        <option value="quarter">Trimestre</option>
                        <option value="year">Année</option>
                    </select>
                </div>
            </div>

            {/* Admin View Navigation */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setAdminView('overview')}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${adminView === 'overview'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    Vue d'Ensemble
                </button>
                <button
                    onClick={() => setAdminView('businesses')}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${adminView === 'businesses'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    Entreprises
                </button>
                <button
                    onClick={() => setAdminView('users')}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${adminView === 'users'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    Utilisateurs
                </button>
                <button
                    onClick={() => setAdminView('products')}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${adminView === 'products'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    Produits
                </button>
            </div>

            {/* Render the selected view */}
            {adminView === 'overview' && renderOverviewView()}
            {adminView === 'businesses' && renderBusinessesView()}
            {adminView === 'users' && renderUsersView()}
            {adminView === 'products' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Produits</h2>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Entreprise:</span>
                            <select
                                value={selectedBusinessId || ''}
                                onChange={(e) => setSelectedBusinessId(e.target.value || null)}
                                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Toutes</option>
                                {allBusinesses.map((business: any) => (
                                    <option key={business.id} value={business.id}>{business.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <ProductList products={getAllProducts()} />
                </div>
            )}
        </div>
    );
};