import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useAttachments(subjectId: number) {
  return useQuery({
    queryKey: ['attachments', subjectId],
    queryFn: async () => {
      const res = await api.get(`/subjects/${subjectId}/attachments`);
      return res.data;
    },
    enabled: !!subjectId,
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ subjectId, file }: { subjectId: number; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(`/subjects/${subjectId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['attachments', vars.subjectId] });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/attachments/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] });
    },
  });
}

export function downloadAttachment(id: number) {
  window.open(`/api/v1/attachments/${id}/download`, '_blank');
}
