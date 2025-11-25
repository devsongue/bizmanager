"use client";

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { Calendar, Filter, Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FinancialTransaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'cancelled';
}

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  transactionCount: number;
}

const DailyFinancialFlow: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Données de transactions financières simulées
  const financialTransactions: FinancialTransaction[] = [
    {
      id: '1',
      date: '2025-11-25',
      type: 'income',
      category: 'Vente',
      description: 'Vente de produits électroniques',
      amount: 150000,
      paymentMethod: 'Cash',
      status: 'completed'
    },
    {
      id: '2',
      date: '2025-11-25',
      type: 'expense',
      category: 'Achat',
      description: 'Achat de stocks',
      amount: 80000,
      paymentMethod: 'Banque',
      status: 'completed'
    },
    {
      id: '3',
      date: '2025-11-25',
      type: 'income',
      category: 'Service',
      description: 'Services de consultation',
      amount: 45000,
      paymentMethod: 'Mobile Money',
      status: 'completed'
    },
    {
      id: '4',
      date: '2025-11-25',
      type: 'expense',
      category: 'Salaire',
      description: 'Salaire employé',
      amount: 120000,
      paymentMethod: 'Banque',
      status: 'completed'
    },
    {
      id: '5',
      date: '2025-11-25',
      type: 'expense',
      category: 'Maintenance',
      description: 'Réparation équipement',
      amount: 25000,
      paymentMethod: 'Cash',
      status: 'completed'
    },
    {
      id: '6',
      date: '2025-11-25',
      type: 'income',
      category: 'Location',
      description: 'Loyer reçu',
      amount: 75000,
      paymentMethod: 'Banque',
      status: 'completed'
    }
  ];

  // Catégories uniques pour le filtre
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(financialTransactions.map(t => t.category))];
    return ['all', ...uniqueCategories];
  }, [financialTransactions]);

  // Filtrer les transactions
  const filteredTransactions = useMemo(() => {
    return financialTransactions.filter(transaction => {
      const dateMatch = transaction.date === selectedDate;
      const typeMatch = filterType === 'all' || transaction.type === filterType;
      const categoryMatch = filterCategory === 'all' || transaction.category === filterCategory;
      
      return dateMatch && typeMatch && categoryMatch;
    });
  }, [financialTransactions, selectedDate, filterType, filterCategory]);

  // Calculer le résumé financier
  const financialSummary: FinancialSummary = useMemo(() => {
    const summary = filteredTransactions.reduce((acc, transaction) => {
      if (transaction.type === 'income') {
        acc.totalIncome += transaction.amount;
      } else {
        acc.totalExpenses += transaction.amount;
      }
      acc.transactionCount += 1;
      return acc;
    }, { totalIncome: 0, totalExpenses: 0, netFlow: 0, transactionCount: 0 });

    summary.netFlow = summary.totalIncome - summary.totalExpenses;
    return summary;
  }, [filteredTransactions]);

  // Données pour le graphique
  const chartData = useMemo(() => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      income: 0,
      expense: 0
    }));

    filteredTransactions.forEach(transaction => {
      const hour = new Date(transaction.date).getHours();
      if (transaction.type === 'income') {
        hourlyData[hour].income += transaction.amount;
      } else {
        hourlyData[hour].expense += transaction.amount;
      }
    });

    return hourlyData;
  }, [filteredTransactions]);

  // Données pour le graphique mensuel
  const monthlyData = useMemo(() => {
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const data = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
      income: 0,
      expense: 0,
      net: 0
    }));

    financialTransactions.forEach(transaction => {
      const day = new Date(transaction.date).getDate();
      const dataIndex = data.findIndex(d => d.date === transaction.date);
      if (dataIndex !== -1) {
        if (transaction.type === 'income') {
          data[dataIndex].income += transaction.amount;
        } else {
          data[dataIndex].expense += transaction.amount;
        }
        data[dataIndex].net = data[dataIndex].income - data[dataIndex].expense;
      }
    });

    return data;
  }, [financialTransactions]);

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Catégorie', 'Description', 'Montant', 'Méthode de Paiement', 'Statut'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.type === 'income' ? 'Entrée' : 'Sortie',
      t.category,
      t.description,
      t.amount,
      t.paymentMethod,
      t.status
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `flux-financier-${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Flux Financiers Quotidiens</h1>
          <p className="text-gray-600 mt-1">Suivi des entrées et sorties financières</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Download size={16} className="mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Filtres et sélection de date */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline-block mr-2 h-4 w-4" />
              Date
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="inline-block mr-2 h-4 w-4" />
              Type
            </label>
            <select
              id="type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous</option>
              <option value="income">Entrées</option>
              <option value="expense">Sorties</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="inline-block mr-2 h-4 w-4" />
              Catégorie
            </label>
            <select
              id="category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Toutes' : category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={() => {
                setSelectedDate(new Date().toISOString().split('T')[0]);
                setFilterType('all');
                setFilterCategory('all');
              }}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-300"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Résumé financier */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Entrées</p>
              <p className="text-2xl font-bold text-gray-900">
                {financialSummary.totalIncome.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border border-red-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sorties</p>
              <p className="text-2xl font-bold text-gray-900">
                {financialSummary.totalExpenses.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Minus className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Flux Net</p>
              <p className={`text-2xl font-bold ${financialSummary.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {financialSummary.netFlow.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{financialSummary.transactionCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Flux Horaires</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${Number(value).toLocaleString('fr-FR')} FCFA`, '']}
                  labelFormatter={(label) => `Heure: ${label}`}
                />
                <Legend />
                <Bar dataKey="income" name="Entrées" fill="#10B981" />
                <Bar dataKey="expense" name="Sorties" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Flux Mensuels</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${Number(value).toLocaleString('fr-FR')} FCFA`, '']}
                  labelFormatter={(label) => `Jour: ${label}`}
                />
                <Legend />
                <Line type="monotone" dataKey="income" name="Entrées" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="expense" name="Sorties" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="net" name="Flux Net" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tableau des transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Détail des Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Méthode</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'income' ? 'Entrée' : 'Sortie'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{transaction.description}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.paymentMethod}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : transaction.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status === 'completed' ? 'Complété' : transaction.status === 'pending' ? 'En attente' : 'Annulé'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune transaction trouvée pour les filtres sélectionnés.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyFinancialFlow;