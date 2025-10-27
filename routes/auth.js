import express from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { JWT_SECRET, JWT_EXPIRES } from "../config.js";
import { isAuthenticated } from "../middleware/authMiddleware.js"; // ✅ import middleware

const router = express.Router();

// -------------------- SIGNUP --------------------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // ✅ Case 1: Google user tries to sign up manually
      if (existingUser.authProvider === "google") {
        return res.status(400).json({
          message:
            "This email is already registered with Google login. Please use Google Sign-In instead.",
        });
      }

      // ✅ Case 2: Local user already exists
      return res.status(400).json({
        message: "User already exists. Please login instead.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      authProvider: "local",
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// -------------------- LOGIN --------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email);

    // 🧩 Step 1 — Validate fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 🧩 Step 2 — Check if user exists
    const user = await User.findOne({ email, authProvider: "local" });
    if (!user) {
      // Don't reveal which part failed (email or password)
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 🧩 Step 3 — Compare password securely
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Unauthorized (wrong password)
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 🧩 Step 4 — Update last login
    user.lastLogin = new Date();
    await user.save();

    // 🧩 Step 5 — Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    // 🧩 Step 6 — Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});


// -------------------- GOOGLE AUTH --------------------
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login",
  }),
  (req, res) => {
    res.redirect("http://localhost:5173/");
  }
);

// -------------------- LOGOUT --------------------
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ success: false, error: "Logout failed" });
    }

    req.session.destroy((err) => {
      if (err) console.error("Session destroy error:", err);
      res.clearCookie("connect.sid", { path: "/" });
      res.json({ success: true, message: "Logged out successfully" });
    });
  });
});

// -------------------- GET CURRENT USER (Google Auth) --------------------
router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      success: true,
      user: {
        id: req.user.id || req.user._id,
        name: req.user.name || req.user.displayName,
        email: req.user.email,
        profilePic:
          req.user.profilePic || req.user.picture || req.user.photo || null,
      },
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }
});

// -------------------- AUTH STATUS --------------------
router.get("/status", (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.isAuthenticated()
      ? {
          id: req.user.id || req.user._id,
          name: req.user.name || req.user.displayName,
          email: req.user.email,
        }
      : null,
  });
});

// -------------------- PROFILE (JWT or Google) --------------------
router.get("/profile", isAuthenticated, async (req, res) => {
  try {
    let user;

    // ✅ If local JWT user
    if (req.user?.id) {
      user = await User.findById(req.user.id).select("-password");
    } 
    // ✅ If Google OAuth user (session-based)
    else if (req.user?._id || req.isAuthenticated()) {
      user = req.user;
    }

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
