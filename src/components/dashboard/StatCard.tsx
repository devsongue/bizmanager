import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    icon: 'revenue' | 'expense' | 'profit' | 'clients';
}

const Icon = ({ icon, colorClass }: { icon: string; colorClass: string }) => {
    // FIX: Changed JSX.Element to React.ReactElement to avoid relying on a global JSX namespace.
    const icons: { [key: string]: React.ReactElement } = {
        revenue: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
        expense: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />,
        profit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />,
        clients: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
    };

    return (
        <div className={`p-3 rounded-full ${colorClass}`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {icons[icon]}
            </svg>
        </div>
    );
};


export const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => {
    const isPositive = change.startsWith('+');
    const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
    
    const iconColors: { [key: string]: string } = {
        revenue: 'bg-blue-500',
        expense: 'bg-red-500',
        profit: 'bg-green-500',
        clients: 'bg-yellow-500',
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-between transition-transform transform hover:-translate-y-1">
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
                <p className={`text-xs ${changeColor}`}>{change} par rapport au mois dernier</p>
            </div>
            <Icon icon={icon} colorClass={iconColors[icon]} />
        </div>
    );
};