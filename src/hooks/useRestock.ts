import { useMutation, useQueryClient } from '@tanstack/react-query';
import { restockProduct } from '@/actions/restockActions';

// Hook for restocking a product
export const useRestockProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, quantity, cost, supplierId }: { id: string; quantity: number; cost: number; supplierId?: string }) => 
      restockProduct(id, quantity, cost, supplierId),
    onSuccess: (_, variables) => {
      // Invalidate all product queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};