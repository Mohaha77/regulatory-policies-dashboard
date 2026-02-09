import { WorkType, SubjectStatus, Priority } from './enums';
import { User } from './user';

export interface Subject {
  id: number;
  title: string;
  description: string;
  type: WorkType;
  priority: Priority;
  status: SubjectStatus;
  dueDate: string | null;
  createdById: number;
  reviewerId: number | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  reviewer?: User;
  assignees?: User[];
}

export interface CreateSubjectInput {
  title: string;
  description: string;
  type: WorkType;
  priority: Priority;
  dueDate?: string;
  assigneeIds?: number[];
  reviewerId?: number;
}

export interface UpdateSubjectInput {
  title?: string;
  description?: string;
  type?: WorkType;
  priority?: Priority;
  dueDate?: string | null;
  reviewerId?: number | null;
}

export interface SubjectFilters {
  type?: WorkType;
  status?: SubjectStatus;
  priority?: Priority;
  assigneeId?: number;
  createdById?: number;
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
