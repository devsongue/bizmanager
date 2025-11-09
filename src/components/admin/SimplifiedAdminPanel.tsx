"use client";

import React, { useState } from 'react';
import type { Business, User, Sale, Expense } from '@/types';
import { useBusinesses } from '@/hooks/useBusiness';
import { useUsers } from '@/hooks/useUser';
import { ProductList } from './ProductList';

interface SimplifiedAdminPanelProps {
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

export const SimplifiedAdminPanel: React.FC<SimplifiedAdminPanelProps> = ({ allBusinesses, allUsers }) => {
    const { data: fetchedBusinesses = [], isLoading: businessesLoading } = useBusinesses();
    const { data: fetchedUsers = [], isLoading: usersLoading } = useUsers();
    const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
    const [reportPeriod, setReportPeriod] = useState<'all' | 'month' | 'quarter' | 'year'>('all');
    const [adminView, setAdminView] = useState<'overview' | 'businesses' | 'users' | 'financial' | 'products'>('overview');

    // Use fetched data if available, otherwise use the prop data
    const displayedBusinesses = fetchedBusinesses.length > 0 ? fetchedBusinesses : allBusinesses;
    const displayedUsers = fetchedUsers.length > 0 ? fetchedUsers : allUsers;

    // Get selected business details
    const selectedBusiness = selectedBusinessId
        ? displayedBusinesses.find((b: any) => b.id === selectedBusinessId)
        : null;

    // Get all products from all businesses or selected business
    const getAllProducts = (): any[] => {
        if (selectedBusiness) {
            return selectedBusiness.products;
        }

        // Flatten products from all businesses and add business name
        return displayedBusinesses.flatMap((business: any) =>
            business.products.map((product: any) => ({
                ...product,
                businessName: business.name
            }))
        );
    };

    // Calculate statistics
    const totalBusinesses = displayedBusinesses.length;
    const totalUsersCount = displayedUsers.length;

    // Simplified financial calculations
    const totalRevenue = displayedBusinesses.reduce((sum: number, business: Business) =>
        sum + business.sales.reduce((saleSum, sale) => saleSum + sale.total, 0), 0);
    
    const totalExpensesAmount = displayedBusinesses.reduce((sum: number, business: Business) =>
        sum + business.expenses.reduce((expenseSum, expense) => expenseSum + expense.amount, 0), 0);
    
    const totalProducts = displayedBusinesses.reduce((sum: number, business: Business) => 
        sum + business.products.length, 0);

    // Calculate profit/loss
    const netProfit = totalRevenue - totalExpensesAmount;

    // Filter data based on selected period
    const filterByPeriod = (items: any[], dateField: string): any[] => {
        if (reportPeriod === 'all') return items;

        const now = new Date();
        const filteredItems = items.filter(item => {
            const itemDate = new Date(item[dateField]);

            switch (reportPeriod) {
                case 'month':
                    return itemDate.getMonth() === now.getMonth() &&
                        itemDate.getFullYear() === now.getFullYear();
                case 'quarter':
                    const currentQuarter = Math.floor(now.getMonth() / 3);
                    const itemQuarter = Math.floor(itemDate.getMonth() / 3);
                    return itemQuarter === currentQuarter &&
                        itemDate.getFullYear() === now.getFullYear();
                case 'year':
                    return itemDate.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });

        return filteredItems;
    };

    // Get filtered sales for display
    const getFilteredSales = (): Sale[] => {
        let allSales: Sale[] = [];

        if (selectedBusiness) {
            allSales = filterByPeriod(selectedBusiness.sales, 'date');
        } else {
            allSales = displayedBusinesses.flatMap((business: any) =>
                filterByPeriod(business.sales, 'date').map((sale: any) => ({
                    ...sale,
                    businessName: business.name
                }))
            );
        }

        return allSales;
    };

    // Get top performing businesses (simplified)
    const getTopPerformingBusinesses = (): any[] => {
        return [...displayedBusinesses]
            .map((business: any) => {
                const totalRevenue = business.sales.reduce((sum: number, sale: Sale) => sum + sale.total, 0);
                const totalExpenses = business.expenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
                const netProfit = totalRevenue - totalExpenses;

                return {
                    ...business,
                    totalRevenue,
                    totalExpenses,
                    netProfit
                };
            })
            .sort((a, b) => b.netProfit - a.netProfit)
            .slice(0, 5);
    };

    if (businessesLoading || usersLoading) {
        return <div className="flex justify-center items-center h-64">Chargement du panneau d'administration...</div>;
    }

    // Render overview view for admin
    const renderOverviewView = () => (
        <div className="space-y-8">
            {/* Executive Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Résumé Exécutif</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Total Entreprises</h3>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">{totalBusinesses}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Utilisateurs Actifs</h3>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-300">{totalUsersCount}</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">Revenus Totaux</h3>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-300">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Bénéfice Net</h3>
                        <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-yellow-600 dark:text-yellow-300' : 'text-red-600 dark:text-red-300'}`}>
                            {formatCurrency(netProfit)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Top Performing Businesses */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Entreprises les Plus Performantes</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Entreprise</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenus</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dépenses</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bénéfice Net</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {getTopPerformingBusinesses().map((businessWithMetrics: any) => (
                                <tr key={businessWithMetrics.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{businessWithMetrics.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{formatCurrency(businessWithMetrics.totalRevenue)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{formatCurrency(businessWithMetrics.totalExpenses)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${businessWithMetrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(businessWithMetrics.netProfit)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Activité Récente</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Montant</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Entreprise</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {getFilteredSales()
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .slice(0, 5)
                                .map((sale: any, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(sale.date).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                                Vente
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                            {formatCurrency(sale.total)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {sale.businessName || (selectedBusiness ? selectedBusiness.name : 'Multiple')}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // Render businesses view for admin
    const renderBusinessesView = () => (
        <div className="space-y-8">
            {/* Business Performance Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Performance des Entreprises</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Entreprise</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenus</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dépenses</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bénéfice Net</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {displayedBusinesses.map((business: any) => {
                                const totalRevenue = calculateTotalSalesRevenue(business.sales);
                                const totalExpenses = calculateTotalExpenses(business.expenses);
                                const netProfit = totalRevenue - totalExpenses;

                                return (
                                    <tr key={business.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{business.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{business.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{formatCurrency(totalRevenue)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{formatCurrency(totalExpenses)}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(netProfit)}
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

    // Render users view for admin
    const renderUsersView = () => (
        <div className="space-y-8">
            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Utilisateurs</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rôle</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Entreprises Gérées</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {displayedUsers.map((user: User) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        <div className="flex items-center">
                                            <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full mr-3" />
                                            {user.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'Admin'
                                                ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                                                : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {user.role === 'Admin'
                                            ? 'Toutes'
                                            : user.managedBusinessIds
                                                ? `${user.managedBusinessIds.length} entreprise(s)`
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

    // Render financial view for admin
    const renderFinancialView = () => (
        <div className="space-y-8">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Entreprises</h3>
                    <p className="text-3xl font-bold text-primary-600 mt-2">{totalBusinesses}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Utilisateurs</h3>
                    <p className="text-3xl font-bold text-primary-600 mt-2">{totalUsersCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Revenus Totaux</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Dépenses Totales</h3>
                    <p className="text-3xl font-bold text-red-600 mt-2">{formatCurrency(totalExpensesAmount)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Bénéfice Net</h3>
                    <p className={`text-3xl font-bold mt-2 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(netProfit)}
                    </p>
                </div>
            </div>

            {/* Business Financial Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Résumé Financier par Entreprise</h2>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Sélectionner une entreprise:</span>
                        <select
                            value={selectedBusinessId || ''}
                            onChange={(e) => setSelectedBusinessId(e.target.value || null)}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Toutes les entreprises</option>
                            {displayedBusinesses.map((business: any) => (
                                <option key={business.id} value={business.id}>{business.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Entreprise</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ventes</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenus</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dépenses</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bénéfice Net</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {(selectedBusiness ? [selectedBusiness] : displayedBusinesses).map((business: any) => {
                                const businessSalesRevenue = calculateTotalSalesRevenue(business.sales);
                                const businessExpensesAmount = calculateTotalExpenses(business.expenses);
                                const businessProfit = businessSalesRevenue - businessExpensesAmount;

                                return (
                                    <tr key={business.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{business.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{business.sales.length}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{formatCurrency(businessSalesRevenue)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{formatCurrency(businessExpensesAmount)}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${businessProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(businessProfit)}
                                        </td>
                                    </tr>
                                );
                            })}
                            {!selectedBusiness && (
                                <tr className="bg-gray-100 dark:bg-gray-700 font-bold">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Total</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {displayedBusinesses.reduce((sum: number, business: Business) => sum + business.sales.length, 0)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{formatCurrency(totalRevenue)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatCurrency(totalExpensesAmount)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(netProfit)}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Panneau d'Administration</h1>
                <div className="flex space-x-4">
                    <select
                        value={reportPeriod}
                        onChange={(e) => setReportPeriod(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">Toute période</option>
                        <option value="month">Ce mois</option>
                        <option value="quarter">Ce trimestre</option>
                        <option value="year">Cette année</option>
                    </select>
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                        Exporter Rapport
                    </button>
                </div>
            </div>

            {/* Admin View Navigation */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setAdminView('overview')}
                    className={`px-4 py-2 rounded-lg transition-colors ${adminView === 'overview'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    Vue d'Ensemble
                </button>
                <button
                    onClick={() => setAdminView('businesses')}
                    className={`px-4 py-2 rounded-lg transition-colors ${adminView === 'businesses'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    Entreprises
                </button>
                <button
                    onClick={() => setAdminView('users')}
                    className={`px-4 py-2 rounded-lg transition-colors ${adminView === 'users'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    Utilisateurs
                </button>
                <button
                    onClick={() => setAdminView('financial')}
                    className={`px-4 py-2 rounded-lg transition-colors ${adminView === 'financial'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    Finances
                </button>
                <button
                    onClick={() => setAdminView('products')}
                    className={`px-4 py-2 rounded-lg transition-colors ${adminView === 'products'
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
            {adminView === 'financial' && renderFinancialView()}
            {adminView === 'products' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Liste des Produits</h2>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Sélectionner une entreprise:</span>
                            <select
                                value={selectedBusinessId || ''}
                                onChange={(e) => setSelectedBusinessId(e.target.value || null)}
                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Toutes les entreprises</option>
                                {displayedBusinesses.map((business: any) => (
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
