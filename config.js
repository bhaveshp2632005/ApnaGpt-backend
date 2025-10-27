// JWT Configuration
import dotenv from "dotenv";
dotenv.config();
export const JWT_SECRET = process.env.JWT_SECRET; // Change this to a secure random string
export const JWT_EXPIRES = process.env.JWT_EXPIRES; // Token expires in 7 days