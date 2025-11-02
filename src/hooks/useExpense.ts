import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getExpenses, 
  createExpense, 
  updateExpense, 
  deleteExpense 
} from '@/actions/expenseActions';
import { Expense } from '@/types';

// Hook for fetching expenses for a business
export const useExpenses = (businessId: string) => {
  return useQuery({
    queryKey: ['expenses', businessId],
    queryFn: () => getExpenses(businessId),
    select: (data) => data.success ? data.data : [],
  });
};

// Hook for creating an expense
export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ businessId, data }: { businessId: string; data: Omit<Expense, 'id'> }) => 
      createExpense(businessId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.businessId] });
    },
  });
};

// Hook for updating an expense
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Expense> }) => 
      updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};

// Hook for deleting an expense
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};