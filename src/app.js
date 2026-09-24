import express from "express";
import cors from "cors";
import helmet from "helmet";

// Middlewares
import {globalLimiter} from "./middleware/rateLimiter.middleware.js";
import {requireApiKey} from "./middleware/apiKey.middleware.js";
import {notFoundHandler} from "./middleware/notFound.middleware.js";
import {errorHandler} from "./middleware/errorHandler.middleware.js";

// Routes
import authRoute from "./modules/auth/auth.route.js";
import userRoute from "./modules/users/user.route.js";
import todoRoute from "./modules/todos/todo.route.js";
import roomRoute from "./modules/rooms/room.route.js";

import {prisma} from "./config/prisma.js";

const app = express();

app.set("trust proxy", 1);

// Security Headers
app.use(helmet());

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000", "http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS: Request origin not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  }),
);

// Body Parser
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({extended: true, limit: "10mb"}));

// Rate Limiter
app.use(globalLimiter);

// Root Welcome Endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Solid Backend API Template is running",
    version: "1.0.0",
    docs: "/api/health",
  });
});

// Health Check Endpoint
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      database: "connected",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      database: "disconnected",
      message: error.message,
    });
  }
});

// Optional API Key Guard (Active only if API_KEYS is set in .env)
app.use("/api", requireApiKey());

// API Module Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/todos", todoRoute);
app.use("/api/rooms", roomRoute);

// 404 Route Not Found Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

export default app;
