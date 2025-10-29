// middleware/isAuthenticated.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import User from "../models/User.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    // ✅ 1. Check if user is logged in via Google (Passport session)
    if (req.isAuthenticated && req.isAuthenticated()) {
      // req.user is set by passport.deserializeUser()
      if (req.user) {
        return next();
      } else {
        return res.status(401).json({ message: "Google session invalid or expired" });
      }
    }

    // ✅ 2. Otherwise, check for JWT-based authentication
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No or invalid token format" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ 3. Fetch user from DB using decoded JWT ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found or deleted" });
    }

    req.user = user; // Attach user info to req
    next();

  } catch (error) {
    console.error("Auth verification failed:", error.message);
    return res.status(401).json({ message: "Unauthorized or invalid token" });
  }
};
