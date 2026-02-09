import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMyReviews } from '@/hooks/useSubjects';
import { useUIStore } from '@/stores/uiStore';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge, PriorityBadge, TypeBadge } from '@/components/subjects/StatusBadge';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRIORITY_BORDER: Record<string, string> = {
  low: 'priority-border-low',
  medium: 'priority-border-medium',
  high: 'priority-border-high',
  urgent: 'priority-border-urgent',
};

export default function ReviewQueuePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useUIStore();
  const { data: subjects = [], isLoading } = useMyReviews();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('nav.reviewQueue')}</h1>

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
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{subject.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <TypeBadge type={subject.type} />
                      <StatusBadge status={subject.status} />
                      <PriorityBadge priority={subject.priority} />
                    </div>
                  </div>
                  <div className="text-end text-xs text-muted-foreground shrink-0">
                    {subject.dueDate && <p>{new Date(subject.dueDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</p>}
                    <p className="mt-1">{language === 'ar' ? subject.createdBy?.displayNameAr : subject.createdBy?.displayNameEn}</p>
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
