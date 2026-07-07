import { Response } from "express";
import { db } from "../db/db";
import { AuthenticatedRequest } from "../middleware/auth";
import { Job } from "../types";

// Create Job (Admin Only)
export const createJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, company, location, jobType, experienceLevel, salaryRange, description, requirements, externalApplyUrl } = req.body;

    if (!title || !company || !location || !jobType || !experienceLevel || !description) {
      res.status(400).json({ message: "All fields except salaryRange and requirements are required." });
      return;
    }

    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({ message: "Access denied. Admin role required." });
      return;
    }

    const reqList = Array.isArray(requirements) 
      ? requirements 
      : typeof requirements === "string" 
        ? requirements.split(",").map((r: string) => r.trim()).filter(Boolean)
        : [];

    const newJob = await db.jobs.create({
      title,
      company,
      location,
      jobType,
      experienceLevel,
      salaryRange: salaryRange || "Not Specified",
      description,
      requirements: reqList,
      status: "Active",
      externalApplyUrl: externalApplyUrl || "",
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Job vacancy created successfully.",
      job: newJob,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error creating job.", error: error.message });
  }
};

// Get All Jobs (Public/Authenticated) with Pagination, Filtering, and Search
export const getAllJobs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, jobType, experienceLevel, location, status, page = "1", limit = "10" } = req.query;

    const allJobs = await db.jobs.find();

    // Filter jobs
    let filteredJobs = allJobs;

    if (search) {
      const q = String(search).toLowerCase();
      filteredJobs = filteredJobs.filter(
        job => 
          job.title.toLowerCase().includes(q) || 
          job.company.toLowerCase().includes(q) || 
          job.description.toLowerCase().includes(q)
      );
    }

    if (jobType) {
      filteredJobs = filteredJobs.filter(job => job.jobType === jobType);
    }

    if (experienceLevel) {
      filteredJobs = filteredJobs.filter(job => job.experienceLevel === experienceLevel);
    }

    if (location) {
      const locQ = String(location).toLowerCase();
      filteredJobs = filteredJobs.filter(job => job.location.toLowerCase().includes(locQ));
    }

    if (status) {
      filteredJobs = filteredJobs.filter(job => job.status === status);
    }

    // Sort: newest first
    filteredJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const p = Math.max(1, parseInt(String(page)) || 1);
    const l = Math.max(1, parseInt(String(limit)) || 10);
    const total = filteredJobs.length;
    const pages = Math.ceil(total / l);
    const startIndex = (p - 1) * l;
    const paginatedJobs = filteredJobs.slice(startIndex, startIndex + l);

    res.status(200).json({
      jobs: paginatedJobs,
      pagination: {
        total,
        page: p,
        limit: l,
        pages,
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching jobs.", error: error.message });
  }
};

// Get Job By ID
export const getJobById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const job = await db.jobs.findById(id);

    if (!job) {
      res.status(404).json({ message: "Job post not found." });
      return;
    }

    res.status(200).json(job);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching job post details.", error: error.message });
  }
};

// Update Job (Admin Only)
export const updateJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, company, location, jobType, experienceLevel, salaryRange, description, requirements, status, externalApplyUrl } = req.body;

    const job = await db.jobs.findById(id);
    if (!job) {
      res.status(404).json({ message: "Job post not found." });
      return;
    }

    const updates: Partial<Job> = {};
    if (title !== undefined) updates.title = title;
    if (company !== undefined) updates.company = company;
    if (location !== undefined) updates.location = location;
    if (jobType !== undefined) updates.jobType = jobType;
    if (experienceLevel !== undefined) updates.experienceLevel = experienceLevel;
    if (salaryRange !== undefined) updates.salaryRange = salaryRange;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (externalApplyUrl !== undefined) updates.externalApplyUrl = externalApplyUrl;

    if (requirements !== undefined) {
      updates.requirements = Array.isArray(requirements)
        ? requirements
        : typeof requirements === "string"
          ? requirements.split(",").map((r: string) => r.trim()).filter(Boolean)
          : [];
    }

    const updatedJob = await db.jobs.findByIdAndUpdate(id, updates);

    res.status(200).json({
      message: "Job vacancy updated successfully.",
      job: updatedJob,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating job vacancy.", error: error.message });
  }
};

// Delete Job (Admin Only)
export const deleteJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const job = await db.jobs.findById(id);

    if (!job) {
      res.status(404).json({ message: "Job post not found." });
      return;
    }

    // Delete job
    const success = await db.jobs.findByIdAndDelete(id);

    if (!success) {
      res.status(500).json({ message: "Could not delete job post." });
      return;
    }

    // Optionally also remove any applications associated with this job
    const allApps = await db.applications.find({ jobId: id });
    for (const app of allApps) {
      await db.applications.findByIdAndDelete(app.id);
    }

    res.status(200).json({ message: "Job post and its associated applications deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting job post.", error: error.message });
  }
};
