import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, type CreateUserSchemaInput } from '@rp/shared';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUsers';
import { useAbsenceCoverage, useCreateAbsenceCoverage, useDeleteAbsenceCoverage } from '@/hooks/useAbsence';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, UserCog, Shield, Trash2 } from 'lucide-react';

export default function UsersPage() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuthStore();
  const { language } = useUIStore();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAbsenceDialog, setShowAbsenceDialog] = useState(false);

  const { data: users = [], isLoading } = useUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const { data: absenceCoverage = [] } = useAbsenceCoverage();
  const createAbsence = useCreateAbsenceCoverage();
  const deleteAbsence = useDeleteAbsenceCoverage();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateUserSchemaInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'user' as any },
  });

  const [absenceForm, setAbsenceForm] = useState({ absentUserId: '', coveringUserId: '', startDate: '', endDate: '' });

  const onCreateUser = (data: CreateUserSchemaInput) => {
    createUser.mutate(data, {
      onSuccess: () => { setShowCreateDialog(false); reset(); },
    });
  };

  const onCreateAbsence = () => {
    createAbsence.mutate({
      absentUserId: Number(absenceForm.absentUserId),
      coveringUserId: Number(absenceForm.coveringUserId),
      startDate: absenceForm.startDate,
      endDate: absenceForm.endDate,
    }, {
      onSuccess: () => { setShowAbsenceDialog(false); setAbsenceForm({ absentUserId: '', coveringUserId: '', startDate: '', endDate: '' }); },
    });
  };

  const getName = (u: any) => language === 'ar' ? u?.displayNameAr : u?.displayNameEn;
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('users.title')}</h1>
          <TabsList>
            <TabsTrigger value="users">{t('users.title')}</TabsTrigger>
            <TabsTrigger value="absence">{t('absence.title')}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users" className="space-y-4">
          {isAdmin && (
            <div className="flex justify-end">
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 me-2" />{t('users.createUser')}
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">{t('common.loading')}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((u: any) => (
                <Card key={u.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{getName(u)}</h3>
                        <p className="text-sm text-muted-foreground">@{u.username}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={u.role === 'admin' ? 'default' : u.role === 'manager' ? 'secondary' : 'outline'}>
                            {t(`roles.${u.role}`)}
                          </Badge>
                          {!u.isActive && <Badge variant="destructive">{t('users.inactive')}</Badge>}
                          {u.isAbsent && <Badge variant="warning">{t('users.absent')}</Badge>}
                        </div>
                      </div>
                      {isAdmin && u.id !== currentUser?.id && (
                        <Button variant="ghost" size="icon" onClick={() => deleteUser.mutate(u.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="absence" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowAbsenceDialog(true)}>
              <Plus className="h-4 w-4 me-2" />{t('absence.create')}
            </Button>
          </div>

          {absenceCoverage.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">{t('common.noData')}</div>
          ) : (
            <div className="space-y-3">
              {absenceCoverage.map((ac: any) => (
                <Card key={ac.id}>
                  <CardContent className="pt-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{getName(ac.absentUser)}</span>
                        <span className="text-muted-foreground mx-2">{'\u2192'}</span>
                        <span className="font-medium">{getName(ac.coveringUser)}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {ac.startDate} - {ac.endDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={ac.isActive ? 'success' : 'secondary'}>
                        {ac.isActive ? t('absence.active') : t('absence.inactive')}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => deleteAbsence.mutate(ac.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('users.createUser')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateUser)} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('auth.username')}</Label>
              <Input {...register('username')} />
              {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>{t('auth.password')}</Label>
              <Input type="password" {...register('password')} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>{t('users.displayNameEn')}</Label>
              <Input {...register('displayNameEn')} />
            </div>
            <div className="space-y-2">
              <Label>{t('users.displayNameAr')}</Label>
              <Input {...register('displayNameAr')} dir="rtl" />
            </div>
            <div className="space-y-2">
              <Label>{t('users.role')}</Label>
              <Select onValueChange={(v) => setValue('role', v as any)} defaultValue="user">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                  <SelectItem value="manager">{t('roles.manager')}</SelectItem>
                  <SelectItem value="user">{t('roles.user')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={createUser.isPending}>{t('common.create')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Absence Coverage Dialog */}
      <Dialog open={showAbsenceDialog} onOpenChange={setShowAbsenceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('absence.create')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('absence.absentUser')}</Label>
              <Select onValueChange={(v) => setAbsenceForm(p => ({ ...p, absentUserId: v }))}>
                <SelectTrigger><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                <SelectContent>
                  {users.filter((u: any) => u.isActive).map((u: any) => (
                    <SelectItem key={u.id} value={String(u.id)}>{getName(u)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('absence.coveringUser')}</Label>
              <Select onValueChange={(v) => setAbsenceForm(p => ({ ...p, coveringUserId: v }))}>
                <SelectTrigger><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                <SelectContent>
                  {users.filter((u: any) => u.isActive && String(u.id) !== absenceForm.absentUserId).map((u: any) => (
                    <SelectItem key={u.id} value={String(u.id)}>{getName(u)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('absence.startDate')}</Label>
              <Input type="date" value={absenceForm.startDate} onChange={(e) => setAbsenceForm(p => ({ ...p, startDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t('absence.endDate')}</Label>
              <Input type="date" value={absenceForm.endDate} onChange={(e) => setAbsenceForm(p => ({ ...p, endDate: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAbsenceDialog(false)}>{t('common.cancel')}</Button>
            <Button onClick={onCreateAbsence} disabled={!absenceForm.absentUserId || !absenceForm.coveringUserId || !absenceForm.startDate || !absenceForm.endDate}>
              {t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
