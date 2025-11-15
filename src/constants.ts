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