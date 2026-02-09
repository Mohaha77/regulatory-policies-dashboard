import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOverviewReport, useWorkloadReport, useRecentActivity } from '@/hooks/useReports';
import { useUIStore } from '@/stores/uiStore';
import { FileText, AlertTriangle, Clock, CheckCircle, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6',
  in_progress: '#f59e0b',
  under_review: '#8b5cf6',
  approved: '#10b981',
  completed: '#06b6a4',
};

const TYPE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

export default function DashboardPage() {
  const { t } = useTranslation();
  const { language } = useUIStore();
  const { data: overview, isLoading: overviewLoading } = useOverviewReport();
  const { data: workload, isLoading: workloadLoading } = useWorkloadReport();
  const { data: recentActivity } = useRecentActivity();

  const statusData = overview?.byStatus?.map((s: any) => ({
    name: t(`status.${s.status}`),
    value: s.count,
    fill: STATUS_COLORS[s.status] || '#6b7280',
  })) || [];

  const typeData = overview?.byType?.map((item: any, idx: number) => ({
    name: t(`types.${item.type}`),
    value: item.count,
    fill: TYPE_COLORS[idx % TYPE_COLORS.length],
  })) || [];

  const workloadData = workload?.map((w: any) => ({
    name: language === 'ar' ? w.user?.displayNameAr : w.user?.displayNameEn,
    count: w.count,
  })) || [];

  const inProgress = overview?.byStatus?.find((s: any) => s.status === 'in_progress')?.count || 0;
  const completed = overview?.byStatus?.find((s: any) => s.status === 'completed')?.count || 0;

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="spinner text-primary" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Card className="stat-card-blue card-hover">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('dashboard.totalSubjects')}</p>
                <p className="text-3xl font-bold mt-1">{overview?.totalSubjects || 0}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card-yellow card-hover">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('dashboard.inProgress')}</p>
                <p className="text-3xl font-bold mt-1">{inProgress}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card-green card-hover">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('dashboard.completed')}</p>
                <p className="text-3xl font-bold mt-1">{completed}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card-red card-hover">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('dashboard.overdue')}</p>
                <p className="text-3xl font-bold mt-1 text-destructive">{overview?.overdue || 0}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{t('dashboard.statusDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">{t('common.noData')}</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} innerRadius={50} paddingAngle={2} label>
                    {statusData.map((entry: any, index: number) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Type Breakdown Pie */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{t('dashboard.typeBreakdown')}</CardTitle>
          </CardHeader>
          <CardContent>
            {typeData.length === 0 ? (
              <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">{t('common.noData')}</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} innerRadius={50} paddingAngle={2} label>
                    {typeData.map((entry: any, index: number) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Workload bar chart */}
      {workloadData.length > 0 && (
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{t('dashboard.workloadDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            {t('dashboard.recentActivity')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!recentActivity || recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t('common.noData')}</p>
          ) : (
            <div className="space-y-1">
              {recentActivity.slice(0, 10).map((a: any, i: number) => (
                <div key={a.id} className="flex items-start gap-3 text-sm py-2.5 border-b last:border-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">
                      {language === 'ar' ? a.user?.displayNameAr : a.user?.displayNameEn}
                    </span>
                    <span className="text-muted-foreground mx-1.5">-</span>
                    <span className="text-muted-foreground">{a.action}</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {new Date(a.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
