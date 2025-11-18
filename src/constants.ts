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
            // Définir le début de la semaine (lundi)
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour que la semaine commence le lundi
            startDate.setDate(diff);
            endDate.setDate(diff + 6);
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
            // Corriger le calcul pour l'année en cours
            startDate.setFullYear(today.getFullYear(), 0, 1);
            endDate.setFullYear(today.getFullYear(), 11, 31);
            return { 
                start: startDate.toISOString().split('T')[0], 
                end: endDate.toISOString().split('T')[0] 
            };
        case DATE_FILTERS.LAST_7_DAYS:
            const last7DaysStart = new Date(today);
            last7DaysStart.setDate(today.getDate() - 6);
            return { 
                start: last7DaysStart.toISOString().split('T')[0], 
                end: today.toISOString().split('T')[0] 
            };
        case DATE_FILTERS.LAST_30_DAYS:
            const last30DaysStart = new Date(today);
            last30DaysStart.setDate(today.getDate() - 29);
            return { 
                start: last30DaysStart.toISOString().split('T')[0], 
                end: today.toISOString().split('T')[0] 
            };
        case DATE_FILTERS.LAST_90_DAYS:
            const last90DaysStart = new Date(today);
            last90DaysStart.setDate(today.getDate() - 89);
            return { 
                start: last90DaysStart.toISOString().split('T')[0], 
                end: today.toISOString().split('T')[0] 
            };
        default:
            return { start: '', end: '' };
    }
};