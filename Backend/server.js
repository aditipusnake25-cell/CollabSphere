import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allowed frontend origins
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://collabsphere-frontend-i4ov.onrender.com"
];

// CORS configuration
app.use(
    cors({
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

// Middleware
app.use(express.json({ limit: "2mb" }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Backend welcome route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to CollabSphere Backend API"
    });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/gemini", geminiRoutes);

// Handle undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error("Server Error:", error.message);

    res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal Server Error"
    });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`CollabSphere server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();