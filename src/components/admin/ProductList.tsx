"use client";

import React, { useState, useMemo } from 'react';
import type { Product } from '@/types';

interface ProductWithBusiness extends Product {
    businessName?: string;
}

interface ProductListProps {
    products: ProductWithBusiness[];
}

const formatCurrency = (amount: number): string => {
    return `${amount?.toLocaleString('fr-FR')} FCFA`;
};

export const ProductList: React.FC<ProductListProps> = ({ products }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'category' | 'stock' | 'retailPrice' | 'wholesalePrice' | 'businessName'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Filter and sort products
    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];
        
        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(product => 
                product.name.toLowerCase().includes(term) ||
                product.category.toLowerCase().includes(term) ||
                product.id.toLowerCase().includes(term) ||
                (product.businessName && product.businessName.toLowerCase().includes(term))
            );
        }
        
        // Sort products
        result.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'category':
                    aValue = a.category.toLowerCase();
                    bValue = b.category.toLowerCase();
                    break;
                case 'stock':
                    aValue = a.stock;
                    bValue = b.stock;
                    break;
                case 'retailPrice':
                    aValue = a.retailPrice;
                    bValue = b.retailPrice;
                    break;
                case 'wholesalePrice':
                    aValue = a.wholesalePrice;
                    bValue = b.wholesalePrice;
                    break;
                case 'businessName':
                    aValue = (a.businessName || '').toLowerCase();
                    bValue = (b.businessName || '').toLowerCase();
                    break;
                default:
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
            }
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            } else {
                return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
            }
        });
        
        return result;
    }, [products, searchTerm, sortBy, sortOrder]);

    // Check if we're showing products from multiple businesses
    const showBusinessColumn = products.some(product => product.businessName);

    const handleSort = (field: 'name' | 'category' | 'stock' | 'retailPrice' | 'wholesalePrice' | 'businessName') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    return (
        <div className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Rechercher des produits par nom, catégorie, entreprise ou ID..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredAndSortedProducts.length} produit(s) trouvé(s)
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center">
                                        <span>Nom</span>
                                        {sortBy === 'name' && (
                                            <span className="ml-1">
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                    onClick={() => handleSort('category')}
                                >
                                    <div className="flex items-center">
                                        <span>Catégorie</span>
                                        {sortBy === 'category' && (
                                            <span className="ml-1">
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                {showBusinessColumn && (
                                    <th 
                                        scope="col" 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                        onClick={() => handleSort('businessName')}
                                    >
                                        <div className="flex items-center">
                                            <span>Entreprise</span>
                                            {sortBy === 'businessName' && (
                                                <span className="ml-1">
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                )}
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                    onClick={() => handleSort('stock')}
                                >
                                    <div className="flex items-center">
                                        <span>Stock</span>
                                        {sortBy === 'stock' && (
                                            <span className="ml-1">
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                    onClick={() => handleSort('retailPrice')}
                                >
                                    <div className="flex items-center">
                                        <span>Prix de détail</span>
                                        {sortBy === 'retailPrice' && (
                                            <span className="ml-1">
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                    onClick={() => handleSort('wholesalePrice')}
                                >
                                    <div className="flex items-center">
                                        <span>Prix de gros</span>
                                        {sortBy === 'wholesalePrice' && (
                                            <span className="ml-1">
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Valeur du stock
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredAndSortedProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={showBusinessColumn ? 7 : 6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        Aucun produit trouvé
                                    </td>
                                </tr>
                            ) : (
                                filteredAndSortedProducts.map((product: any) => (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {product.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {product.category}
                                        </td>
                                        {showBusinessColumn && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {product.businessName}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {product.stock}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                            {formatCurrency(product.retailPrice)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                                            {formatCurrency(product.wholesalePrice)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-medium">
                                            {formatCurrency(product.stock * product.wholesalePrice)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};