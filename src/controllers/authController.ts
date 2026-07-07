import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/db";
import { AuthenticatedRequest } from "../middleware/auth";

const JWT_SECRET = process.env.JWT_SECRET || "fresher-job-tracker-jwt-secret-key-2026";

export const registerUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email, and password are required." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Please provide a valid email address." });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters long." });
      return;
    }

    const userRole = role === "admin" ? "admin" : "student";

    const existingUser = await db.users.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "A user with this email already exists." });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await db.users.create({
      name,
      email,
      passwordHash,
      role: userRole,
      profile: userRole === "student" ? {
        skills: [],
        bio: "",
        phone: "",
        education: "",
        experience: "",
      } : undefined,
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully.",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profile: newUser.profile,
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error registering user.", error: error.message });
  }
};

export const loginUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const user = await db.users.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error during login.", error: error.message });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const user = await db.users.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching user profile.", error: error.message });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const user = await db.users.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const { skills, bio, phone, education, experience } = req.body;

    const currentProfile = user.profile || {
      skills: [],
      bio: "",
      phone: "",
      education: "",
      experience: "",
    };

    const updatedProfile = {
      ...currentProfile,
      skills: Array.isArray(skills) ? skills : currentProfile.skills,
      bio: typeof bio === "string" ? bio : currentProfile.bio,
      phone: typeof phone === "string" ? phone : currentProfile.phone,
      education: typeof education === "string" ? education : currentProfile.education,
      experience: typeof experience === "string" ? experience : currentProfile.experience,
    };

    const updatedUser = await db.users.findByIdAndUpdate(req.user.id, {
      profile: updatedProfile,
    });

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        id: updatedUser?.id,
        name: updatedUser?.name,
        email: updatedUser?.email,
        role: updatedUser?.role,
        profile: updatedUser?.profile,
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating profile.", error: error.message });
  }
};
