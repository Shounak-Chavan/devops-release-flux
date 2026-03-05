import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Database and Cache Services
import redisClient from "./services/redisClient.js";

// Controllers
import { register, login } from "./controllers/authController.js"; // Added login 
import { createProject, getProjects } from "./controllers/projectController.js";
import { evaluateFlags } from "./controllers/evaluationController.js";
import { createFlag, getFlags, toggleFlagState, updateFlagRules } from "./controllers/flagsController.js";
import { getFlagAuditHistory } from "./controllers/auditController.js";

// Middleware
import { requireAuth } from "./middleware/authMiddleware.js";
import { authLimiter, evaluationLimiter } from "./middleware/rateLimiter.js";
import {
  projectSchema,
  flagSchema,
  registerSchema,
  loginSchema,
  toggleFlagSchema,
  validateBody,
  validateQuery,
  getFlagsQuerySchema,
  flagIdParamSchema,
  validateParams,
} from "./middleware/validate.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Security and Logging Middleware
app.use(helmet()); 
app.use(morgan("dev")); 

// Standard Middleware
app.use(cors());
app.use(express.json());

// --- Public Routes ---

// Auth
app.post("/api/auth/register", authLimiter, validateBody(registerSchema), register);
app.post("/api/auth/login", authLimiter, validateBody(loginSchema), login); // Added login route 

// High-Throughput Evaluation Route (SDKs hit this) [cite: 79]
// REMOVED validateBody(loginSchema) - context is dynamic and handled in the controller 
app.post(
  "/api/v1/evaluate",
  evaluationLimiter,
  evaluateFlags
);

// --- Private Routes (Management Plane) [cite: 63] ---

// Project Routes
app.get('/api/projects', requireAuth, getProjects);
app.post('/api/projects', requireAuth, validateBody(projectSchema), createProject);

// Flag Routes
app.get('/api/flags', requireAuth, validateQuery(getFlagsQuerySchema), getFlags);
app.post('/api/flags', requireAuth, validateBody(flagSchema), createFlag);
app.put(
  '/api/flags/:flagId/environments/:environmentId', 
  requireAuth, 
  validateBody(toggleFlagSchema), 
  toggleFlagState
);

// Advanced Rules Logic [cite: 41]
app.put('/api/flags/:flagId/environments/:environmentId/rules', requireAuth, updateFlagRules);

// Audit Route 
app.get('/api/audit/:flagId', requireAuth, validateParams(flagIdParamSchema), getFlagAuditHistory);

// Centralized Error Handling
app.use(errorHandler);

// --- Server Lifecycle ---

const PORT = process.env.PORT || 4000;
let server;

// CRITICAL: Only start the listener if NOT in a test environment
// This prevents Jest from hanging on open handles
if (process.env.NODE_ENV !== "test") {
  server = app.listen(PORT, () => {
    console.log(`FeatureFlow SaaS API running on port ${PORT}`);
  });
}

// --- Graceful Shutdown Logic ---
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Closing HTTP server and connections...`);

  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");
      try {
        await prisma.$disconnect();
        console.log("PostgreSQL connection closed.");
        await redisClient.quit();
        console.log("Redis connection closed.");
        process.exit(0);
      } catch (err) {
        console.error("Error during shutdown:", err);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

// Termination signals
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default app;