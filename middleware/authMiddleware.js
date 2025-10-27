// middleware/isAuthenticated.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import User from "../models/User.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    // ✅ 1. Google OAuth session-based login
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }

    // ✅ 2. JWT-based local login
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No or invalid token format" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ 3. Fetch user from DB (important!)
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user; // attach user object to req
    next();
  } catch (error) {
    console.error("Auth verification failed:", error.message);
    return res.status(401).json({ message: "Unauthorized or invalid token" });
  }
};
