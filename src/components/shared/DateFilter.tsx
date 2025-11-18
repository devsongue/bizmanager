import React, { useState } from 'react';
import { DATE_FILTERS, getDateRange } from '../../constants';

interface DateFilterProps {
    onDateRangeChange: (start: string, end: string) => void;
    className?: string;
}

export const DateFilter: React.FC<DateFilterProps> = ({ onDateRangeChange, className = '' }) => {
    const [selectedFilter, setSelectedFilter] = useState(DATE_FILTERS.CUSTOM);
    const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const filter = e.target.value;
        setSelectedFilter(filter);
        
        if (filter !== DATE_FILTERS.CUSTOM) {
            const range = getDateRange(filter);
            setCustomDateRange(range);
            onDateRangeChange(range.start, range.end);
        }
    };

    const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
        const newRange = { ...customDateRange, [type]: value };
        setCustomDateRange(newRange);
        
        // Only trigger callback if both dates are set
        if (newRange.start && newRange.end) {
            onDateRangeChange(newRange.start, newRange.end);
        }
    };

    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <select 
                value={selectedFilter}
                onChange={handleFilterChange}
                className="border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-white"
            >
                <option value={DATE_FILTERS.CUSTOM}>Personnalisé</option>
                <option value={DATE_FILTERS.TODAY}>Aujourd'hui</option>
                <option value={DATE_FILTERS.THIS_WEEK}>Cette semaine</option>
                <option value={DATE_FILTERS.LAST_7_DAYS}>7 derniers jours</option>
                <option value={DATE_FILTERS.LAST_30_DAYS}>30 derniers jours</option>
                <option value={DATE_FILTERS.LAST_90_DAYS}>90 derniers jours</option>
                <option value={DATE_FILTERS.THIS_MONTH}>Ce mois</option>
                <option value={DATE_FILTERS.THIS_YEAR}>Cette année</option>
            </select>
            
            {selectedFilter === DATE_FILTERS.CUSTOM && (
                <>
                    <input 
                        type="date" 
                        value={customDateRange.start}
                        onChange={e => handleCustomDateChange('start', e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-white"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">au</span>
                    <input 
                        type="date" 
                        value={customDateRange.end}
                        onChange={e => handleCustomDateChange('end', e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-white"
                    />
                </>
            )}
        </div>
    );
};