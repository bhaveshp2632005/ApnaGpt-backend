import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import "./config/passport.js"; // Must load BEFORE routes
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import  userlogin from "./routes/User.js"; // Add this line

dotenv.config();
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true only for HTTPS
    httpOnly: true,
    maxAge: 24*60*60*1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());



// Routes
app.use("/auth", authRoutes);
app.use("/api", chatRoutes);
 // Add this line

app.get("/", (req, res) => res.send("Server running ✅"));

mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB error:", err));

app.listen(process.env.PORT || 8000, () => console.log("🚀 Server running"));
