import { useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, language } = useUIStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return <>{children}</>;
}
