import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getClients, 
  createClient, 
  updateClient, 
  deleteClient 
} from '@/actions/clientActions';
import { Client } from '@/types';

// Hook for fetching clients for a business
export const useClients = (businessId: string) => {
  return useQuery({
    queryKey: ['clients', businessId],
    queryFn: () => getClients(businessId),
    select: (data) => data.success ? data.data : [],
  });
};

// Hook for creating a client
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ businessId, data }: { businessId: string; data: Omit<Client, 'id'> }) => 
      createClient(businessId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients', variables.businessId] });
    },
  });
};

// Hook for updating a client
export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) => 
      updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

// Hook for deleting a client
export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};