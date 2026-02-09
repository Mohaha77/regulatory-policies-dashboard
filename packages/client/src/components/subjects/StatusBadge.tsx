import { useTranslation } from 'react-i18next';
import { Badge } from '../ui/badge';
import { SubjectStatus, Priority, WorkType } from '@rp/shared';

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'> = {
  new: 'info',
  in_progress: 'warning',
  under_review: 'secondary',
  approved: 'success',
  completed: 'success',
};

const priorityVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'> = {
  low: 'secondary',
  medium: 'default',
  high: 'warning',
  urgent: 'destructive',
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  return <Badge variant={statusVariants[status] || 'default'}>{t(`status.${status}`)}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const { t } = useTranslation();
  return <Badge variant={priorityVariants[priority] || 'default'}>{t(`priority.${priority}`)}</Badge>;
}

export function TypeBadge({ type }: { type: string }) {
  const { t } = useTranslation();
  return <Badge variant="outline">{t(`types.${type}`)}</Badge>;
}
