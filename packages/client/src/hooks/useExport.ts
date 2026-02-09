import api from '@/lib/api';

export function useExport() {
  const exportMyWorkExcel = async () => {
    const res = await api.get('/export/my-work/excel', { responseType: 'blob' });
    downloadBlob(res.data, 'my-work.xlsx');
  };

  const exportMyWorkWord = async () => {
    const res = await api.get('/export/my-work/word', { responseType: 'blob' });
    downloadBlob(res.data, 'my-work.docx');
  };

  const exportSubjectsExcel = async (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    const res = await api.get(`/export/subjects/excel?${params.toString()}`, { responseType: 'blob' });
    downloadBlob(res.data, 'subjects.xlsx');
  };

  return { exportMyWorkExcel, exportMyWorkWord, exportSubjectsExcel };
}

function downloadBlob(data: Blob, filename: string) {
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
