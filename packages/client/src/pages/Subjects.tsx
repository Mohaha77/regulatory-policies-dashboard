import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSubjects } from '@/hooks/useSubjects';
import { useExport } from '@/hooks/useExport';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, PriorityBadge, TypeBadge } from '@/components/subjects/StatusBadge';
import { Plus, Download, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRIORITY_BORDER: Record<string, string> = {
  low: 'priority-border-low',
  medium: 'priority-border-medium',
  high: 'priority-border-high',
  urgent: 'priority-border-urgent',
};

export default function SubjectsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useUIStore();
  const { user } = useAuthStore();
  const { exportSubjectsExcel } = useExport();
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, limit: 20 });
  const [search, setSearch] = useState('');

  const { data, isLoading } = useSubjects({ ...filters, search: search || undefined });

  const subjects = data?.data || [];
  const pagination = data?.pagination;

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value === 'all' ? undefined : value, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('subjects.title')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportSubjectsExcel(filters)}>
            <Download className="h-4 w-4 me-2" />
            {t('export.excel')}
          </Button>
          <Button size="sm" onClick={() => navigate('/subjects/new')}>
            <Plus className="h-4 w-4 me-2" />
            {t('subjects.createNew')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('subjects.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ps-9 h-9"
              />
            </div>
            <Select onValueChange={(v) => handleFilterChange('type', v)} value={filters.type || 'all'}>
              <SelectTrigger className="h-9"><SelectValue placeholder={t('subjects.type')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="consultation">{t('types.consultation')}</SelectItem>
                <SelectItem value="review">{t('types.review')}</SelectItem>
                <SelectItem value="studies">{t('types.studies')}</SelectItem>
                <SelectItem value="other">{t('types.other')}</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(v) => handleFilterChange('status', v)} value={filters.status || 'all'}>
              <SelectTrigger className="h-9"><SelectValue placeholder={t('subjects.status')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="new">{t('status.new')}</SelectItem>
                <SelectItem value="in_progress">{t('status.in_progress')}</SelectItem>
                <SelectItem value="under_review">{t('status.under_review')}</SelectItem>
                <SelectItem value="approved">{t('status.approved')}</SelectItem>
                <SelectItem value="completed">{t('status.completed')}</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(v) => handleFilterChange('priority', v)} value={filters.priority || 'all'}>
              <SelectTrigger className="h-9"><SelectValue placeholder={t('subjects.priority')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="low">{t('priority.low')}</SelectItem>
                <SelectItem value="medium">{t('priority.medium')}</SelectItem>
                <SelectItem value="high">{t('priority.high')}</SelectItem>
                <SelectItem value="urgent">{t('priority.urgent')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="h-9" onClick={() => { setFilters({ page: 1, limit: 20 }); setSearch(''); }}>
              <X className="h-4 w-4 me-2" />
              {t('subjects.clearFilters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subjects List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="spinner text-primary" style={{ width: 28, height: 28 }} />
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">{t('subjects.noSubjects')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {subjects.map((subject: any) => (
            <Card
              key={subject.id}
              className={cn(
                'cursor-pointer card-hover',
                PRIORITY_BORDER[subject.priority] || ''
              )}
              onClick={() => navigate(`/subjects/${subject.id}`)}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{subject.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{subject.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      <TypeBadge type={subject.type} />
                      <StatusBadge status={subject.status} />
                      <PriorityBadge priority={subject.priority} />
                    </div>
                  </div>
                  <div className="text-end text-sm text-muted-foreground shrink-0">
                    {subject.dueDate && (
                      <p className="text-xs">{new Date(subject.dueDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</p>
                    )}
                    <p className="text-xs mt-1">
                      {language === 'ar' ? subject.createdBy?.displayNameAr : subject.createdBy?.displayNameEn}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
              >
                {t('common.previous')}
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {t('common.showing')} {pagination.page} {t('common.of')} {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setFilters(p => ({ ...p, page: (p.page || 1) + 1 }))}
              >
                {t('common.next')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
