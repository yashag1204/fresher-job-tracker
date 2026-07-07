import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/db";
import { UserRole } from "../types";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || "fresher-job-tracker-jwt-secret-key-2026";

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: UserRole };
    
    // Double check user exists in db
    const user = await db.users.findById(decoded.id);
    if (!user) {
      res.status(401).json({ message: "Invalid session. User no longer exists." });
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized." });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: `Access denied. Requires one of these roles: ${roles.join(", ")}` });
      return;
    }

    next();
  };
};
