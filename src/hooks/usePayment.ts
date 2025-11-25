import { useQuery } from '@tanstack/react-query';
import { getClientPayments, getBusinessPayments } from '@/actions/paymentActions';

// Hook for fetching payment history for a client
export const useClientPayments = (clientId: string) => {
  return useQuery({
    queryKey: ['payments', clientId],
    queryFn: () => getClientPayments(clientId),
    select: (data) => data.success ? data.data : [],
  });
};

// Hook for fetching all payments for a business
export const useBusinessPayments = (businessId: string) => {
  return useQuery({
    queryKey: ['payments', 'business', businessId],
    queryFn: () => getBusinessPayments(businessId),
    select: (data) => data.success ? data.data : [],
  });
};