import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { loginSchema, type LoginInput } from '@rp/shared';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Shield } from 'lucide-react';

export function LoginForm() {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
    } catch {
      setError(t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl shadow-2xl p-8 space-y-6">
      {/* Logo / Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 dark:bg-white/10 backdrop-blur-sm mb-2">
          <Shield className="h-9 w-9 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">{t('auth.login')}</h1>
        <p className="text-sm text-white/70">{t('app.title')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-white/90 text-sm font-medium">{t('auth.username')}</Label>
          <Input
            id="username"
            {...register('username')}
            autoComplete="username"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-white/40 h-11"
            placeholder={t('auth.username')}
          />
          {errors.username && <p className="text-sm text-red-300">{errors.username.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/90 text-sm font-medium">{t('auth.password')}</Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            autoComplete="current-password"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-white/40 h-11"
            placeholder={t('auth.password')}
          />
          {errors.password && <p className="text-sm text-red-300">{errors.password.message}</p>}
        </div>
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 rounded-lg px-4 py-2.5">
            <p className="text-sm text-red-200 text-center">{error}</p>
          </div>
        )}
        <Button
          type="submit"
          className="w-full h-11 bg-white text-blue-700 hover:bg-white/90 font-semibold text-base shadow-lg"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="spinner" />
              {t('common.loading')}
            </span>
          ) : (
            t('auth.loginButton')
          )}
        </Button>
      </form>
    </div>
  );
}
