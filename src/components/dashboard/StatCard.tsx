import React from 'react';
import { TrendingUp, TrendingDown, Users, Wallet, Receipt, PiggyBank } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    icon: 'revenue' | 'expense' | 'profit' | 'clients';
}

const Icon = ({ icon, colorClass }: { icon: string; colorClass: string }) => {
    // FIX: Changed JSX.Element to React.ReactElement to avoid relying on a global JSX namespace.
    const icons: { [key: string]: React.ReactElement } = {
        revenue: <Wallet className="w-6 h-6 text-white" />,
        expense: <Receipt className="w-6 h-6 text-white" />,
        profit: <PiggyBank className="w-6 h-6 text-white" />,
        clients: <Users className="w-6 h-6 text-white" />,
    };

    return (
        <div className={`p-3 rounded-lg ${colorClass}`}>
            {icons[icon]}
        </div>
    );
};


export const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => {
    const isPositive = change.startsWith('+');
    const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
    
    const iconColors: { [key: string]: string } = {
        revenue: 'bg-gradient-to-br from-orange-500 to-orange-600',
        expense: 'bg-gradient-to-br from-red-500 to-red-600',
        profit: 'bg-gradient-to-br from-green-500 to-green-600',
        clients: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg flex items-center justify-between transition-all duration-300 hover:shadow-xl">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
                <p className={`text-xs ${changeColor} flex items-center mt-2`}>
                    {isPositive ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {change} par rapport au mois dernier
                </p>
            </div>
            <Icon icon={icon} colorClass={iconColors[icon]} />
        </div>
    );
};