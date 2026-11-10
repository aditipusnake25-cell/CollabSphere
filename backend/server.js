
import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import projectRoutes from "./routes/projectRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.resolve(__dirname, "../frontend/dist");
const assetsPath = path.join(frontendPath, "assets");
const indexPath = path.join(frontendPath, "index.html");

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use((req, res, next) => {
  const requestOrigin = `${req.protocol}://${req.get("host")}`;
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || origin === requestOrigin) {
        return callback(null, true);
      }

      return callback(
        new Error(`Origin not allowed by CORS: ${origin}`)
      );
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })(req, res, next);
});

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    message: "CollabSphere backend is running!",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api", noteRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/ai", geminiRoutes);

// Authenticated profile
app.get("/api/auth/profile", authMiddleware, (req, res) => {
  res.json({
    message: "You are logged in successfully!",
    user: req.user,
  });
});

// Serve frontend assets explicitly
app.use(
  "/assets",
  express.static(assetsPath, {
    fallthrough: false,
    index: false,
  })
);

// Serve other frontend static files, such as favicon.svg
app.use(
  express.static(frontendPath, {
    index: false,
  })
);

// Return JSON for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    message: "API route not found",
  });
});

// React frontend fallback
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return next();
  }

  if (!fs.existsSync(indexPath)) {
    return res.status(500).send(
      `Frontend build not found: ${indexPath}. Run npm.cmd run build in the frontend folder.`
    );
  }

  res.sendFile(indexPath, (error) => {
    if (error && !res.headersSent) {
      next(error);
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Request error:", err);

  if (res.headersSent) {
    return next(err);
  }

  const status =
    err.status ||
    err.statusCode ||
    (err.code === "LIMIT_FILE_SIZE" || err.name === "MulterError" ? 400 : 500);

  if (req.path.startsWith("/api")) {
    return res.status(status).json({
      message: err.message || "Internal server error",
    });
  }

  return res.status(status).send(
    err.message || "Internal server error"
  );
});

// Start server
const startServer = async () => {
  try {
    console.log("Frontend build path:", frontendPath);
    console.log("Frontend index exists:", fs.existsSync(indexPath));
    console.log("Frontend assets folder exists:", fs.existsSync(assetsPath));

    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
};

startServer();
