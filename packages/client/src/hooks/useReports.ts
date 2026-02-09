import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useOverviewReport() {
  return useQuery({
    queryKey: ['reports', 'overview'],
    queryFn: async () => {
      const res = await api.get('/reports/overview');
      return res.data;
    },
  });
}

export function useWorkloadReport() {
  return useQuery({
    queryKey: ['reports', 'workload'],
    queryFn: async () => {
      const res = await api.get('/reports/workload');
      return res.data;
    },
  });
}

export function usePerformanceReport() {
  return useQuery({
    queryKey: ['reports', 'performance'],
    queryFn: async () => {
      const res = await api.get('/reports/performance');
      return res.data;
    },
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['reports', 'recent-activity'],
    queryFn: async () => {
      const res = await api.get('/reports/recent-activity');
      return res.data;
    },
  });
}
