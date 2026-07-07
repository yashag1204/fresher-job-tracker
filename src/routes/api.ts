import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth";
import { uploadResume } from "../middleware/upload";
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
} from "../controllers/authController";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/jobController";
import {
  applyToJob,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} from "../controllers/applicationController";
import { getDashboardStats } from "../controllers/dashboardController";
import { handleResumeUpload } from "../controllers/uploadController";

const router = Router();

// ==========================================
// AUTH & PROFILE ROUTES
// ==========================================
router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.get("/auth/me", authenticateToken as any, getMe as any);
router.put("/auth/profile", authenticateToken as any, updateProfile as any);

// ==========================================
// JOB VACANCY ROUTES
// ==========================================
router.post("/jobs", authenticateToken as any, requireRole(["admin"]) as any, createJob as any);
router.get("/jobs", getAllJobs as any);
router.get("/jobs/:id", getJobById as any);
router.put("/jobs/:id", authenticateToken as any, requireRole(["admin"]) as any, updateJob as any);
router.delete("/jobs/:id", authenticateToken as any, requireRole(["admin"]) as any, deleteJob as any);

// ==========================================
// APPLICATION ROUTES
// ==========================================
router.post("/applications", authenticateToken as any, requireRole(["student"]) as any, applyToJob as any);
router.get("/applications", authenticateToken as any, getApplications as any);
router.get("/applications/:id", authenticateToken as any, getApplicationById as any);
router.put("/applications/:id", authenticateToken as any, updateApplication as any);
router.delete("/applications/:id", authenticateToken as any, deleteApplication as any);

// ==========================================
// RESUME UPLOAD ROUTE
// ==========================================
router.post(
  "/applications/upload-resume",
  authenticateToken as any,
  requireRole(["student"]) as any,
  (req, res, next) => {
    uploadResume.single("resume")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  handleResumeUpload as any
);

// ==========================================
// DASHBOARD ANALYTICS ROUTES
// ==========================================
router.get("/dashboard/stats", authenticateToken as any, getDashboardStats as any);

export default router;
