import express from 'express';
import Thread from '../models/Thread.js';
import { getGeminiResponse } from '../utils/openai.js';
import { v4 as uuid } from 'uuid';
import { isAuthenticated } from '../middleware/authMiddleware.js';

import dotenv from "dotenv";
dotenv.config();


const router = express.Router();

// ✅ Get all threads for the logged-in user
router.get('/threads', isAuthenticated, async (req, res) => {
  try {
    const threads = await Thread.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(threads);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching threads', error });
  }
});

// ✅ Get single thread by threadId for logged-in user
router.get('/threads/:threadId', isAuthenticated, async (req, res) => {
  const { threadId } = req.params;
  try {
    const thread = await Thread.findOne({ threadId, user: req.user._id });
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    res.json(thread);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching thread', error });
  }
});

// ✅ Delete thread by threadId for logged-in user
router.delete('/threads/:threadId', isAuthenticated, async (req, res) => {
  const { threadId } = req.params;
  try {
    const thread = await Thread.findOneAndDelete({ threadId, user: req.user._id });
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    res.json({ message: 'Thread deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting thread', error });
  }
});

// ✅ Chat route: create or append to thread for logged-in user
router.post("/chat", isAuthenticated, async (req, res) => {
  const { threadId, message } = req.body;
  



  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    let thread;

    if (threadId) {
      thread = await Thread.findOne({ threadId, user: req.user._id });
    }

    if (!thread) {
      thread = new Thread({
        threadId: uuid(),
        title: message,
        messages: [{ role: "user", content: message }],
        user: req.user._id,
      });
    } else {
      thread.messages.push({ role: "user", content: message });
    }

    // ✅ Get AI response
    const assistantReply = await getGeminiResponse(message);
    thread.messages.push({ role: "assistant", content: assistantReply });
    thread.updatedAt = new Date();

    await thread.save();

    res.json({ reply: assistantReply, threadId: thread.threadId });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});


export default router;



