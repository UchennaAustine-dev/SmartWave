import { Request, Response } from "express";

// Middleware to check user role
export const checkRole = (role: string) => {
  return (req: any, res: Response, next: Function) => {
    if (req.user && (req.user.role === role || req.user.role === "admin")) {
      next(); // User has the correct role
    } else {
      res
        .status(403)
        .json({ error: "Access denied. Insufficient permissions." });
    }
  };
};
