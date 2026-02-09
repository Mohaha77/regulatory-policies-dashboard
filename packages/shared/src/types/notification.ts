import { NotificationType } from './enums';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  subjectId: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface Comment {
  id: number;
  subjectId: number;
  authorId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: number;
    username: string;
    displayNameEn: string;
    displayNameAr: string;
  };
}

export interface Attachment {
  id: number;
  subjectId: number;
  uploadedById: number;
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  uploadedBy?: {
    id: number;
    username: string;
    displayNameEn: string;
    displayNameAr: string;
  };
}

export interface AbsenceCoverage {
  id: number;
  absentUserId: number;
  coveringUserId: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  absentUser?: {
    id: number;
    displayNameEn: string;
    displayNameAr: string;
  };
  coveringUser?: {
    id: number;
    displayNameEn: string;
    displayNameAr: string;
  };
}

export interface ActivityLog {
  id: number;
  userId: number;
  subjectId: number | null;
  action: string;
  details: Record<string, unknown>;
  createdAt: string;
}
