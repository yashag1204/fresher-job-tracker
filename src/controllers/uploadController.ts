import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { db } from "../db/db";

export const handleResumeUpload = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    if (req.user.role !== "student") {
      res.status(403).json({ message: "Only students are required to upload resumes." });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "Please upload a valid file." });
      return;
    }

    const user = await db.users.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const currentProfile = user.profile || {
      skills: [],
      bio: "",
      phone: "",
      education: "",
      experience: "",
    };

    const updatedProfile = {
      ...currentProfile,
      resumeUrl: `/uploads/${req.file.filename}`,
      resumeName: req.file.originalname,
      resumeUploadedAt: new Date().toISOString(),
    };

    const updatedUser = await db.users.findByIdAndUpdate(req.user.id, {
      profile: updatedProfile,
    });

    res.status(200).json({
      message: "Resume uploaded successfully.",
      resume: {
        resumeName: req.file.originalname,
        resumeUrl: `/uploads/${req.file.filename}`,
        uploadedAt: updatedProfile.resumeUploadedAt,
      },
      user: {
        id: updatedUser?.id,
        name: updatedUser?.name,
        email: updatedUser?.email,
        role: updatedUser?.role,
        profile: updatedUser?.profile,
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error uploading resume.", error: error.message });
  }
};
