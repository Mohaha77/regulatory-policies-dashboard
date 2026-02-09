import { z } from 'zod';
import { WorkType, SubjectStatus, Priority } from '../types/enums';

export const createSubjectSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(5000),
  type: z.nativeEnum(WorkType),
  priority: z.nativeEnum(Priority),
  dueDate: z.string().optional(),
  assigneeIds: z.array(z.number().int().positive()).optional(),
  reviewerId: z.number().int().positive().optional(),
});

export const updateSubjectSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().min(1).max(5000).optional(),
  type: z.nativeEnum(WorkType).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.string().nullable().optional(),
  reviewerId: z.number().int().positive().nullable().optional(),
});

export const statusChangeSchema = z.object({
  status: z.nativeEnum(SubjectStatus),
});

export const assignmentSchema = z.object({
  userId: z.number().int().positive(),
});

export const reviewerSchema = z.object({
  reviewerId: z.number().int().positive().nullable(),
});

export const commentSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const absenceCoverageSchema = z.object({
  absentUserId: z.number().int().positive(),
  coveringUserId: z.number().int().positive(),
  startDate: z.string(),
  endDate: z.string(),
});

export type CreateSubjectSchemaInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectSchemaInput = z.infer<typeof updateSubjectSchema>;
export type StatusChangeSchemaInput = z.infer<typeof statusChangeSchema>;
export type AssignmentSchemaInput = z.infer<typeof assignmentSchema>;
export type ReviewerSchemaInput = z.infer<typeof reviewerSchema>;
export type CommentSchemaInput = z.infer<typeof commentSchema>;
export type AbsenceCoverageSchemaInput = z.infer<typeof absenceCoverageSchema>;
