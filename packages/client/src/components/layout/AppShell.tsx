import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

export function AppShell() {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background">
      <Sidebar />
      <div className={cn(
        'transition-all duration-300 min-h-screen',
        sidebarOpen ? 'ltr:ml-64 rtl:mr-64' : 'ltr:ml-16 rtl:mr-16'
      )}>
        <Header />
        <main className="p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
