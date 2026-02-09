import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, FileText, Briefcase, CheckSquare,
  Users, Settings, ChevronLeft, ChevronRight, Shield
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { path: '/subjects', icon: FileText, labelKey: 'nav.subjects' },
  { path: '/my-work', icon: Briefcase, labelKey: 'nav.myWork' },
  { path: '/review-queue', icon: CheckSquare, labelKey: 'nav.reviewQueue' },
];

const adminItems = [
  { path: '/users', icon: Users, labelKey: 'nav.users' },
];

export function Sidebar() {
  const { t } = useTranslation();
  const { sidebarOpen, toggleSidebar, language } = useUIStore();
  const { user } = useAuthStore();
  const isRtl = language === 'ar';

  return (
    <aside className={cn(
      'fixed top-0 bottom-0 z-40 flex flex-col bg-card border-e transition-all duration-300 shadow-sm',
      sidebarOpen ? 'w-64' : 'w-16',
      isRtl ? 'right-0' : 'left-0'
    )}>
      {/* Logo area */}
      <div className="flex items-center justify-between h-16 px-4 border-b bg-primary/5 dark:bg-primary/10">
        {sidebarOpen && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 shrink-0">
              <Shield className="h-4.5 w-4.5 text-primary" />
            </div>
            <span className="font-bold text-sm truncate">{t('app.shortTitle')}</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-accent transition-colors shrink-0"
        >
          {sidebarOpen
            ? (isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />)
            : (isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)
          }
        </button>
      </div>

      <nav className="flex-1 py-3 space-y-1 px-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              !sidebarOpen && 'justify-center px-0'
            )}
          >
            <item.icon className={cn('h-5 w-5 shrink-0')} />
            {sidebarOpen && <span>{t(item.labelKey)}</span>}
          </NavLink>
        ))}

        {(user?.role === 'admin' || user?.role === 'manager') && (
          <>
            <div className="my-3 mx-3 border-t" />
            {adminItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  !sidebarOpen && 'justify-center px-0'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{t(item.labelKey)}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="border-t p-2">
        <NavLink
          to="/settings"
          className={({ isActive }) => cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
            isActive
              ? 'bg-primary/10 text-primary shadow-sm'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            !sidebarOpen && 'justify-center px-0'
          )}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {sidebarOpen && <span>{t('nav.settings')}</span>}
        </NavLink>
      </div>
    </aside>
  );
}
