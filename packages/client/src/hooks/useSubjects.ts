import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useSubjects(filters: Record<string, any> = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      params.set(key, String(value));
    }
  });

  return useQuery({
    queryKey: ['subjects', filters],
    queryFn: async () => {
      const res = await api.get(`/subjects?${params.toString()}`);
      return res.data;
    },
  });
}

export function useSubject(id: number | string) {
  return useQuery({
    queryKey: ['subjects', id],
    queryFn: async () => {
      const res = await api.get(`/subjects/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useMyWork() {
  return useQuery({
    queryKey: ['my-work'],
    queryFn: async () => {
      const res = await api.get('/subjects/my-work');
      return res.data;
    },
  });
}

export function useMyReviews() {
  return useQuery({
    queryKey: ['my-reviews'],
    queryFn: async () => {
      const res = await api.get('/subjects/my-reviews');
      return res.data;
    },
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/subjects', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['my-work'] });
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await api.put(`/subjects/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/subjects/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

export function useChangeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await api.patch(`/subjects/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['my-work'] });
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
    },
  });
}

export function useAddAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ subjectId, userId }: { subjectId: number; userId: number }) => {
      const res = await api.post(`/subjects/${subjectId}/assignments`, { userId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

export function useRemoveAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ subjectId, userId }: { subjectId: number; userId: number }) => {
      const res = await api.delete(`/subjects/${subjectId}/assignments`, { data: { userId } });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

export function useSetReviewer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ subjectId, reviewerId }: { subjectId: number; reviewerId: number | null }) => {
      const res = await api.put(`/subjects/${subjectId}/reviewer`, { reviewerId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}
