import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import api from '../lib/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setUser } = useAuthStore();
  const { setLanguage, setTheme } = useUIStore();

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/auth/me').then((res) => {
        setUser(res.data);
        if (res.data.preferredLang) setLanguage(res.data.preferredLang);
        if (res.data.preferredTheme) setTheme(res.data.preferredTheme);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}
