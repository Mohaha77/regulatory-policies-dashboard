import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function NotificationBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();
  const [open, setOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markRead = useMutation({
    mutationFn: (id: number) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  // SSE connection
  useEffect(() => {
    if (!accessToken) return;

    const eventSource = new EventSource(`/api/v1/notifications/stream?token=${accessToken}`);

    eventSource.addEventListener('notification', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [accessToken, queryClient]);

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute top-full mt-2 end-0 w-80 rounded-lg border bg-popover shadow-lg z-50">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-semibold text-sm">{t('notifications.title')}</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-xs text-primary hover:underline"
              >
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">{t('notifications.noNotifications')}</p>
            ) : (
              notifications.slice(0, 20).map((n: any) => (
                <button
                  key={n.id}
                  className={cn(
                    'w-full text-start p-3 border-b last:border-0 hover:bg-accent transition-colors',
                    !n.isRead && 'bg-primary/5'
                  )}
                  onClick={() => {
                    if (!n.isRead) markRead.mutate(n.id);
                    if (n.subjectId) navigate(`/subjects/${n.subjectId}`);
                    setOpen(false);
                  }}
                >
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
