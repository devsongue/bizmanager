import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getSuppliers, 
  createSupplier, 
  updateSupplier, 
  deleteSupplier 
} from '@/actions/supplierActions';
import { Supplier } from '@/types';

// Hook for fetching suppliers for a business
export const useSuppliers = (businessId: string) => {
  return useQuery({
    queryKey: ['suppliers', businessId],
    queryFn: () => getSuppliers(businessId),
    select: (data) => data.success ? data.data : [],
  });
};

// Hook for creating a supplier
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ businessId, data }: { businessId: string; data: Omit<Supplier, 'id'> }) => 
      createSupplier(businessId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', variables.businessId] });
    },
  });
};

// Hook for updating a supplier
export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Supplier> }) => 
      updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

// Hook for deleting a supplier
export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};