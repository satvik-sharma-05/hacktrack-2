// src/config/env.js
import dotenv from "dotenv";
dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  MONGO_URI: process.env.MONGO_URI,

  JWT_SECRET: process.env.JWT_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET || 'change-me',

  // API keys
  DEVPOST_API_KEY: process.env.DEVPOST_API_KEY,
  EVENTBRITE_API_KEY: process.env.EVENTBRITE_API_KEY,
  CLIST_USERNAME: process.env.CLIST_USERNAME,
  CLIST_API_KEY: process.env.CLIST_API_KEY,

  // OAuth
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,

  LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
  LINKEDIN_CALLBACK_URL: process.env.LINKEDIN_CALLBACK_URL,

  // Email (Forgot Password)
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,

  // OpenAI 
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  // Cache TTL
  CACHE_TTL_MIN: parseInt(process.env.CACHE_TTL_MIN || '180', 10),
};
