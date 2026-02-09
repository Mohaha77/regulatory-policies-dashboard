import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useUpdatePreferences } from '@/hooks/useUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Moon, Sun, Languages, Lock, Check } from 'lucide-react';
import api from '@/lib/api';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const { theme, setTheme, language, setLanguage } = useUIStore();
  const updatePrefs = useUpdatePreferences();

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleLanguageChange = (lang: 'en' | 'ar') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    if (user) {
      updatePrefs.mutate({ id: user.id, data: { preferredLang: lang } });
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (user) {
      updatePrefs.mutate({ id: user.id, data: { preferredTheme: newTheme } });
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError(t('settings.passwordMismatch'));
      return;
    }
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswordSuccess(t('common.success'));
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      setPasswordError(t('common.error'));
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">{t('settings.title')}</h1>

      {/* Preferences */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">{t('settings.preferences')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">{t('settings.language')}</Label>
              <p className="text-xs text-muted-foreground">{t('settings.languageDesc')}</p>
            </div>
            <Select value={language} onValueChange={(v) => handleLanguageChange(v as 'en' | 'ar')}>
              <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t('settings.english')}</SelectItem>
                <SelectItem value="ar">{t('settings.arabic')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">{t('settings.theme')}</Label>
              <p className="text-xs text-muted-foreground">{t('settings.themeDesc')}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                className="h-9"
                onClick={() => handleThemeChange('light')}
              >
                <Sun className="h-4 w-4 me-1.5" />{t('settings.lightMode')}
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                className="h-9"
                onClick={() => handleThemeChange('dark')}
              >
                <Moon className="h-4 w-4 me-1.5" />{t('settings.darkMode')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Lock className="h-4 w-4" />
            {t('auth.changePassword')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm">{t('auth.currentPassword')}</Label>
            <Input
              type="password"
              className="h-9"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">{t('auth.newPassword')}</Label>
            <Input
              type="password"
              className="h-9"
              value={passwords.newPassword}
              onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">{t('auth.confirmPassword')}</Label>
            <Input
              type="password"
              className="h-9"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
            />
          </div>
          {passwordError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              <p className="text-sm text-destructive">{passwordError}</p>
            </div>
          )}
          {passwordSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-600">{passwordSuccess}</p>
            </div>
          )}
          <Button size="sm" onClick={handleChangePassword} disabled={!passwords.currentPassword || !passwords.newPassword}>
            {t('auth.changePassword')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
