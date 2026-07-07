import { Response } from "express";
import { db } from "../db/db";
import { AuthenticatedRequest } from "../middleware/auth";
import { Application } from "../types";

// Submit an Application (Student Only)
export const applyToJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { jobId, notes } = req.body;

    if (!jobId) {
      res.status(400).json({ message: "jobId is required to apply." });
      return;
    }

    if (!req.user || req.user.role !== "student") {
      res.status(403).json({ message: "Access denied. Only students can apply for jobs." });
      return;
    }

    const job = await db.jobs.findById(jobId);
    if (!job) {
      res.status(404).json({ message: "Job post does not exist." });
      return;
    }

    if (job.status === "Closed") {
      res.status(400).json({ message: "This job post is closed and no longer accepting applications." });
      return;
    }

    // Check if duplicate application exists
    const existingApps = await db.applications.find({ jobId, userId: req.user.id });
    if (existingApps.length > 0) {
      res.status(400).json({ message: "You have already applied for this job. Freshers can apply only once per position." });
      return;
    }

    // Retrieve user's resume if available
    const student = await db.users.findById(req.user.id);
    const resumeUrl = student?.profile?.resumeUrl;
    const resumeName = student?.profile?.resumeName;

    const newApplication = await db.applications.create({
      jobId,
      userId: req.user.id,
      status: "Applied",
      appliedDate: new Date().toISOString(),
      notes: notes || "",
      resumeUrl,
      resumeName,
    });

    res.status(201).json({
      message: "Application submitted successfully.",
      application: newApplication,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error submitting application.", error: error.message });
  }
};

// Get All Applications (Admin gets all with optional filter; Student gets only their own)
export const getApplications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized." });
      return;
    }

    let applicationsList: Application[] = [];

    if (req.user.role === "admin") {
      // Admin sees all applications
      const { status, jobId } = req.query;
      const filter: Partial<Application> = {};
      if (status) filter.status = status as any;
      if (jobId) filter.jobId = jobId as any;

      applicationsList = await db.applications.find(filter);
    } else {
      // Student sees only their own
      applicationsList = await db.applications.find({ userId: req.user.id });
    }

    // Enhance applications with job and user details
    const enhancedApps = await Promise.all(
      applicationsList.map(async (app) => {
        const job = await db.jobs.findById(app.jobId);
        const applicant = await db.users.findById(app.userId);
        return {
          ...app,
          jobDetails: job ? {
            title: job.title,
            company: job.company,
            location: job.location,
            salaryRange: job.salaryRange,
          } : null,
          applicantDetails: applicant ? {
            name: applicant.name,
            email: applicant.email,
            profile: applicant.profile,
          } : null,
        };
      })
    );

    // Sort: newest first
    enhancedApps.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());

    res.status(200).json(enhancedApps);
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving applications.", error: error.message });
  }
};

// Get Application By ID (Admin or the student who owns it)
export const getApplicationById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const app = await db.applications.findById(id);

    if (!app) {
      res.status(404).json({ message: "Application not found." });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized." });
      return;
    }

    if (req.user.role !== "admin" && app.userId !== req.user.id) {
      res.status(403).json({ message: "Access denied. You do not own this application." });
      return;
    }

    const job = await db.jobs.findById(app.jobId);
    const applicant = await db.users.findById(app.userId);

    res.status(200).json({
      ...app,
      jobDetails: job ? {
        title: job.title,
        company: job.company,
        location: job.location,
        salaryRange: job.salaryRange,
      } : null,
      applicantDetails: applicant ? {
        name: applicant.name,
        email: applicant.email,
        profile: applicant.profile,
      } : null,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving application.", error: error.message });
  }
};

// Update Application (Admin can update status, interviewDate, feedback. Student can update notes/cover letter)
export const updateApplication = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes, interviewDate, feedback } = req.body;

    const app = await db.applications.findById(id);
    if (!app) {
      res.status(404).json({ message: "Application not found." });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized." });
      return;
    }

    const updates: Partial<Application> = {};

    if (req.user.role === "admin") {
      // Admin is allowed to edit anything including status
      if (status !== undefined) updates.status = status;
      if (interviewDate !== undefined) updates.interviewDate = interviewDate;
      if (feedback !== undefined) updates.feedback = feedback;
      if (notes !== undefined) updates.notes = notes;
    } else {
      // Student is only allowed to edit notes/cover letter
      if (app.userId !== req.user.id) {
        res.status(403).json({ message: "Access denied." });
        return;
      }
      if (notes !== undefined) updates.notes = notes;
      
      // If student tries to change admin fields, throw error
      if (status !== undefined || interviewDate !== undefined || feedback !== undefined) {
        res.status(403).json({ message: "Forbidden. Only Admins can modify status, interview dates, or feedback." });
        return;
      }
    }

    const updatedApp = await db.applications.findByIdAndUpdate(id, updates);

    res.status(200).json({
      message: "Application updated successfully.",
      application: updatedApp,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating application.", error: error.message });
  }
};

// Delete/Withdraw Application (Admin can delete, Student can withdraw if they own it)
export const deleteApplication = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const app = await db.applications.findById(id);

    if (!app) {
      res.status(404).json({ message: "Application not found." });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized." });
      return;
    }

    if (req.user.role !== "admin" && app.userId !== req.user.id) {
      res.status(403).json({ message: "Access denied. Cannot withdraw application." });
      return;
    }

    const success = await db.applications.findByIdAndDelete(id);

    if (!success) {
      res.status(500).json({ message: "Could not withdraw application." });
      return;
    }

    res.status(200).json({ message: "Application withdrawn successfully." });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting/withdrawing application.", error: error.message });
  }
};
