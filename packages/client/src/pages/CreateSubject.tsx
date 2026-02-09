import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSubjectSchema, type CreateSubjectSchemaInput } from '@rp/shared';
import { useCreateSubject } from '@/hooks/useSubjects';
import { useUsers } from '@/hooks/useUsers';
import { useUIStore } from '@/stores/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

export default function CreateSubjectPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useUIStore();
  const createSubject = useCreateSubject();
  const { data: users = [] } = useUsers();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateSubjectSchemaInput>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: { priority: 'medium' as any, type: 'consultation' as any },
  });

  const getName = (u: any) => language === 'ar' ? u?.displayNameAr : u?.displayNameEn;

  const onSubmit = (data: CreateSubjectSchemaInput) => {
    createSubject.mutate(data, {
      onSuccess: (result) => navigate(`/subjects/${result.id}`),
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{t('subjects.createNew')}</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('subjects.subjectTitle')}</Label>
              <Input {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>{t('subjects.description')}</Label>
              <Textarea {...register('description')} rows={4} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('subjects.type')}</Label>
                <Select onValueChange={(v) => setValue('type', v as any)} defaultValue="consultation">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">{t('types.consultation')}</SelectItem>
                    <SelectItem value="review">{t('types.review')}</SelectItem>
                    <SelectItem value="studies">{t('types.studies')}</SelectItem>
                    <SelectItem value="other">{t('types.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('subjects.priority')}</Label>
                <Select onValueChange={(v) => setValue('priority', v as any)} defaultValue="medium">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('priority.low')}</SelectItem>
                    <SelectItem value="medium">{t('priority.medium')}</SelectItem>
                    <SelectItem value="high">{t('priority.high')}</SelectItem>
                    <SelectItem value="urgent">{t('priority.urgent')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('subjects.dueDate')}</Label>
              <Input type="date" {...register('dueDate')} />
            </div>

            <div className="space-y-2">
              <Label>{t('subjects.reviewer')}</Label>
              <Select onValueChange={(v) => setValue('reviewerId', Number(v))}>
                <SelectTrigger><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                <SelectContent>
                  {users.filter((u: any) => u.isActive && u.role !== 'user').map((u: any) => (
                    <SelectItem key={u.id} value={String(u.id)}>{getName(u)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={createSubject.isPending}>
                {createSubject.isPending ? t('common.loading') : t('common.create')}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
