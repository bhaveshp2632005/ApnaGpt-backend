import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

// Optional: check SDK version
const pkgPath = path.resolve(
  "./node_modules/@google/genai/package.json"
);
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
// console.log("Google GenAI SDK version:", pkg.version);

// Initialize Gemini AI with API key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const getGeminiResponse = async (message) => {
  try {
    // console.log("Gemini Key Loaded:", !!process.env.GEMINI_API_KEY);

    // Send user message to Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // or "gemini-2.0-flash-exp", "gemini-1.5-pro"
      contents: message,
    });

    const text = response.text;
    // console.log("Gemini Response:", text);
    return text;

  } catch (error) {
    console.error("Gemini error:", error);
    return "Sorry, AI is not responding right now.";
  }
};