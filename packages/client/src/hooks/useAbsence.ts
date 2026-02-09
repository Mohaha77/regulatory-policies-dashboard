import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useAbsenceCoverage() {
  return useQuery({
    queryKey: ['absence-coverage'],
    queryFn: async () => {
      const res = await api.get('/absence-coverage');
      return res.data;
    },
  });
}

export function useCreateAbsenceCoverage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/absence-coverage', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absence-coverage'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateAbsenceCoverage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await api.put(`/absence-coverage/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absence-coverage'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteAbsenceCoverage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/absence-coverage/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absence-coverage'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
