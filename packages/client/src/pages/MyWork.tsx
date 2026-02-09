import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMyWork } from '@/hooks/useSubjects';
import { useExport } from '@/hooks/useExport';
import { useUIStore } from '@/stores/uiStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, PriorityBadge, TypeBadge } from '@/components/subjects/StatusBadge';
import { FileSpreadsheet, FileText, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRIORITY_BORDER: Record<string, string> = {
  low: 'priority-border-low',
  medium: 'priority-border-medium',
  high: 'priority-border-high',
  urgent: 'priority-border-urgent',
};

export default function MyWorkPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useUIStore();
  const { data: subjects = [], isLoading } = useMyWork();
  const { exportMyWorkExcel, exportMyWorkWord } = useExport();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.myWork')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportMyWorkExcel}>
            <FileSpreadsheet className="h-4 w-4 me-2" />
            {t('export.myWorkExcel')}
          </Button>
          <Button variant="outline" size="sm" onClick={exportMyWorkWord}>
            <FileText className="h-4 w-4 me-2" />
            {t('export.myWorkWord')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="spinner text-primary" style={{ width: 28, height: 28 }} />
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Inbox className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <p className="text-muted-foreground">{t('subjects.noSubjects')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {subjects.map((subject: any) => (
            <Card
              key={subject.id}
              className={cn('cursor-pointer card-hover', PRIORITY_BORDER[subject.priority] || '')}
              onClick={() => navigate(`/subjects/${subject.id}`)}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{subject.title}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <TypeBadge type={subject.type} />
                      <StatusBadge status={subject.status} />
                      <PriorityBadge priority={subject.priority} />
                    </div>
                  </div>
                  <div className="text-end text-xs text-muted-foreground shrink-0">
                    {subject.dueDate && <p>{new Date(subject.dueDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
