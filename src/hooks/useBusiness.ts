import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getBusinesses, 
  getBusinessById,
  createBusiness, 
  updateBusiness, 
  deleteBusiness 
} from '@/actions/businessActions';
import { Business } from '@/types';

// Hook for fetching all businesses
export const useBusinesses = () => {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: getBusinesses,
    select: (data) => data.success ? data.data : [],
  });
};

// Hook for fetching a single business by ID
export const useBusiness = (id: string) => {
  return useQuery({
    queryKey: ['business', id],
    queryFn: () => getBusinessById(id),
    select: (data) => data.success ? data.data : null,
    enabled: !!id, // Only run the query if id is truthy
  });
};

// Hook for creating a business
export const useCreateBusiness = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
};

// Hook for updating a business
export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Business> }) => 
      updateBusiness(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
};

// Hook for deleting a business
export const useDeleteBusiness = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
};