import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSubject, useChangeStatus, useAddAssignment, useRemoveAssignment, useSetReviewer, useDeleteSubject } from '@/hooks/useSubjects';
import { useComments, useAddComment, useDeleteComment } from '@/hooks/useComments';
import { useAttachments, useUploadAttachment, useDeleteAttachment, downloadAttachment } from '@/hooks/useAttachments';
import { useUsers } from '@/hooks/useUsers';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { StatusBadge, PriorityBadge, TypeBadge } from '@/components/subjects/StatusBadge';
import { VALID_STATUS_TRANSITIONS, SubjectStatus } from '@rp/shared';
import { ArrowLeft, Send, Upload, Download, Trash2, UserPlus, UserMinus, X } from 'lucide-react';
import { useState, useRef } from 'react';

export default function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { language } = useUIStore();
  const [commentText, setCommentText] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [reviewerId, setReviewerId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: subject, isLoading } = useSubject(Number(id));
  const { data: comments = [] } = useComments(Number(id));
  const { data: attachments = [] } = useAttachments(Number(id));
  const { data: allUsers = [] } = useUsers();

  const changeStatus = useChangeStatus();
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const uploadAttachment = useUploadAttachment();
  const deleteAttachment = useDeleteAttachment();
  const addAssignment = useAddAssignment();
  const removeAssignment = useRemoveAssignment();
  const setReviewer = useSetReviewer();
  const deleteSubject = useDeleteSubject();

  if (isLoading) return <div className="text-center py-12">{t('common.loading')}</div>;
  if (!subject) return <div className="text-center py-12">{t('common.error')}</div>;

  const currentStatus = subject.status as SubjectStatus;
  const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canManage = isAdmin || isManager;

  const handleStatusChange = (newStatus: string) => {
    changeStatus.mutate({ id: Number(id), status: newStatus });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment.mutate({ subjectId: Number(id), content: commentText });
    setCommentText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAttachment.mutate({ subjectId: Number(id), file });
    }
  };

  const handleAddAssignment = () => {
    if (assigneeId) {
      addAssignment.mutate({ subjectId: Number(id), userId: Number(assigneeId) });
      setAssigneeId('');
    }
  };

  const handleSetReviewer = () => {
    if (reviewerId) {
      setReviewer.mutate({ subjectId: Number(id), reviewerId: Number(reviewerId) });
      setReviewerId('');
    }
  };

  const handleDelete = () => {
    if (window.confirm(t('subjects.deleteConfirm'))) {
      deleteSubject.mutate(Number(id), { onSuccess: () => navigate('/subjects') });
    }
  };

  const getName = (u: any) => language === 'ar' ? u?.displayNameAr : u?.displayNameEn;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold flex-1">{subject.title}</h1>
        {canManage && (
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 me-2" />{t('subjects.delete')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <TypeBadge type={subject.type} />
                <StatusBadge status={subject.status} />
                <PriorityBadge priority={subject.priority} />
              </div>
              <p className="text-sm whitespace-pre-wrap">{subject.description}</p>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('subjects.createdBy')}:</span>
                  <span className="ms-2 font-medium">{getName(subject.createdBy)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('subjects.dueDate')}:</span>
                  <span className="ms-2 font-medium">
                    {subject.dueDate ? new Date(subject.dueDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US') : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('subjects.createdAt')}:</span>
                  <span className="ms-2">{new Date(subject.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('subjects.updatedAt')}:</span>
                  <span className="ms-2">{new Date(subject.updatedAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status transitions */}
          {validTransitions.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium mb-3">{t('subjects.status')}:</p>
                <div className="flex flex-wrap gap-2">
                  {validTransitions.map((status) => (
                    <Button
                      key={status}
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(status)}
                      disabled={changeStatus.isPending}
                    >
                      {t(`status.${status}`)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('comments.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('comments.noComments')}</p>
                ) : (
                  comments.map((comment: any) => (
                    <div key={comment.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{getName(comment.author)}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </span>
                          {(comment.authorId === user?.id || isAdmin) && (
                            <button onClick={() => deleteComment.mutate(comment.id)} className="text-destructive hover:underline text-xs">
                              {t('comments.delete')}
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))
                )}
                <div className="flex gap-2">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={t('comments.placeholder')}
                    className="flex-1"
                    rows={2}
                  />
                  <Button onClick={handleAddComment} disabled={!commentText.trim() || addComment.isPending} size="icon" className="shrink-0 self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('attachments.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attachments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('attachments.noAttachments')}</p>
                ) : (
                  attachments.map((att: any) => (
                    <div key={att.id} className="flex items-center justify-between border rounded-lg p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{att.originalName}</p>
                        <p className="text-xs text-muted-foreground">
                          {(att.sizeBytes / 1024).toFixed(1)} KB - {getName(att.uploadedBy)}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => downloadAttachment(att.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        {(att.uploadedById === user?.id || isAdmin) && (
                          <Button variant="ghost" size="icon" onClick={() => deleteAttachment.mutate(att.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadAttachment.isPending}>
                    <Upload className="h-4 w-4 me-2" />
                    {t('attachments.upload')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignees */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('subjects.assignees')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {subject.assignees?.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between">
                    <span className="text-sm">{getName(a)}</span>
                    {canManage && (
                      <button onClick={() => removeAssignment.mutate({ subjectId: Number(id), userId: a.id })}>
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    )}
                  </div>
                ))}
                {canManage && (
                  <div className="flex gap-2 mt-3">
                    <Select value={assigneeId} onValueChange={setAssigneeId}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                      <SelectContent>
                        {allUsers.filter((u: any) => u.isActive && !subject.assignees?.find((a: any) => a.id === u.id)).map((u: any) => (
                          <SelectItem key={u.id} value={String(u.id)}>{getName(u)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="outline" onClick={handleAddAssignment} disabled={!assigneeId}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reviewer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('subjects.reviewer')}</CardTitle>
            </CardHeader>
            <CardContent>
              {subject.reviewer ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm">{getName(subject.reviewer)}</span>
                  {canManage && (
                    <button onClick={() => setReviewer.mutate({ subjectId: Number(id), reviewerId: null })}>
                      <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">-</p>
              )}
              {canManage && !subject.reviewer && (
                <div className="flex gap-2 mt-3">
                  <Select value={reviewerId} onValueChange={setReviewerId}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                    <SelectContent>
                      {allUsers.filter((u: any) => u.isActive && u.role !== 'user').map((u: any) => (
                        <SelectItem key={u.id} value={String(u.id)}>{getName(u)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="outline" onClick={handleSetReviewer} disabled={!reviewerId}>
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
