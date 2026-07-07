export type UserRole = "student" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  profile?: {
    skills: string[];
    bio: string;
    phone: string;
    education: string;
    experience: string;
    resumeUrl?: string;
    resumeName?: string;
    resumeUploadedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: "Full-time" | "Part-time" | "Internship" | "Contract";
  experienceLevel: "Fresher" | "0-1 years" | "1-2 years" | "3+ years";
  salaryRange: string;
  description: string;
  requirements: string[];
  status: "Active" | "Closed";
  externalApplyUrl?: string;
  createdBy: string; // admin user id
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: "Applied" | "Screening" | "Interview" | "Offer" | "Rejected";
  appliedDate: string;
  notes: string;
  resumeUrl?: string;
  resumeName?: string;
  interviewDate?: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalJobs: number;
  totalApplications: number;
  applicationsByStatus: {
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    rejected: number;
  };
  jobsByType: {
    "Full-time": number;
    "Part-time": number;
    "Internship": number;
    "Contract": number;
  };
  recentApplications: Array<{
    id: string;
    jobTitle: string;
    company: string;
    applicantName: string;
    appliedDate: string;
    status: string;
  }>;
}
