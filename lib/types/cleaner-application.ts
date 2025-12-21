export type CleanerApplicationStatus = 
  | "pending" 
  | "reviewed" 
  | "approved" 
  | "rejected" 
  | "hired";

export interface CleanerApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  experienceYears: number;
  previousExperience?: string;
  availability?: string;
  preferredAreas?: string[];
  languages?: string[];
  referencesInfo?: string;
  additionalInfo?: string;
  status: CleanerApplicationStatus;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CleanerApplicationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  experienceYears: number;
  previousExperience?: string;
  availability?: string;
  preferredAreas?: string[];
  languages?: string[];
  referencesInfo?: string;
  additionalInfo?: string;
}

export interface CleanerApplicationStats {
  total: number;
  pending: number;
  reviewed: number;
  approved: number;
  rejected: number;
  hired: number;
}
