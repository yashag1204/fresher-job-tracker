import { Response } from "express";
import { db } from "../db/db";
import { AuthenticatedRequest } from "../middleware/auth";
import { DashboardStats, Application, Job } from "../types";

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const { role, id: userId } = req.user;

    const allJobs = await db.jobs.find();
    const allApps = await db.applications.find();
    const allUsers = await db.users.find();

    const activeJobsCount = allJobs.filter(j => j.status === "Active").length;

    // Filter applications based on role
    const userApps = role === "admin" ? allApps : allApps.filter(app => app.userId === userId);

    // 1. Initial counts
    const totalJobs = role === "admin" ? allJobs.length : activeJobsCount;
    const totalApplications = userApps.length;

    // 2. Count by status
    const applicationsByStatus = {
      applied: 0,
      screening: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    };

    userApps.forEach((app) => {
      const statusKey = app.status.toLowerCase() as keyof typeof applicationsByStatus;
      if (statusKey in applicationsByStatus) {
        applicationsByStatus[statusKey]++;
      }
    });

    // 3. Count jobs by type
    const jobsByType = {
      "Full-time": 0,
      "Part-time": 0,
      "Internship": 0,
      "Contract": 0,
    };

    allJobs.forEach((job) => {
      if (job.jobType in jobsByType) {
        jobsByType[job.jobType]++;
      }
    });

    // 4. Fetch details of 5 most recent applications
    const recentAppsList = userApps
      .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
      .slice(0, 5);

    const recentApplications = await Promise.all(
      recentAppsList.map(async (app) => {
        const job = await db.jobs.findById(app.jobId);
        const applicant = await db.users.findById(app.userId);
        return {
          id: app.id,
          jobTitle: job ? job.title : "Unknown Role",
          company: job ? job.company : "Unknown Company",
          applicantName: applicant ? applicant.name : "Anonymous Candidate",
          appliedDate: app.appliedDate,
          status: app.status,
        };
      })
    );

    const statsPayload = {
      role,
      totalJobs,
      totalApplications,
      applicationsByStatus,
      jobsByType,
      recentApplications,
      adminSummary: role === "admin" ? {
        totalStudents: allUsers.filter(u => u.role === "student").length,
        totalAdmins: allUsers.filter(u => u.role === "admin").length,
        totalClosedJobs: allJobs.filter(j => j.status === "Closed").length,
      } : undefined,
    };

    res.status(200).json(statsPayload);
  } catch (error: any) {
    res.status(500).json({ message: "Error compiling dashboard statistics.", error: error.message });
  }
};
