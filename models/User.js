import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // Common fields
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
   profilePic: { type: String },
  authProvider: { 
    type: String, 
    enum: ["local", "google"], 
    default: "local" 
  },

  // Local login fields
  password: { type: String },  // only required if authProvider = "local"

  // Google login fields
  googleId: { type: String },

  // Meta fields
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
