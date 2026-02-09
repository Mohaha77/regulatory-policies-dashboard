export enum WorkType {
  CONSULTATION = 'consultation',
  REVIEW = 'review',
  STUDIES = 'studies',
  OTHER = 'other',
}

export enum SubjectStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  COMPLETED = 'completed',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

export enum NotificationType {
  ASSIGNMENT = 'assignment',
  STATUS_CHANGE = 'status_change',
  REVIEW_REQUEST = 'review_request',
  COMMENT = 'comment',
}

export const VALID_STATUS_TRANSITIONS: Record<SubjectStatus, SubjectStatus[]> = {
  [SubjectStatus.NEW]: [SubjectStatus.IN_PROGRESS],
  [SubjectStatus.IN_PROGRESS]: [SubjectStatus.UNDER_REVIEW],
  [SubjectStatus.UNDER_REVIEW]: [SubjectStatus.APPROVED, SubjectStatus.IN_PROGRESS],
  [SubjectStatus.APPROVED]: [SubjectStatus.COMPLETED],
  [SubjectStatus.COMPLETED]: [],
};
