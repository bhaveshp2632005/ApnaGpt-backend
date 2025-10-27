import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ThreadSchema = new mongoose.Schema({
  threadId: {
    type: String,
    required: true,
    unique: true,
    default: uuid
  },
  title: {
    type: String,
    default: "New Chat"
  },
  messages: [MessageSchema],

  // 👇 Link each thread to a user
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on every save
ThreadSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Thread", ThreadSchema);
