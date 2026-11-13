import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDistPath = path.resolve(__dirname, "../frontend/dist");

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5001",
    "https://collabsphere-frontend-i4ov.onrender.com"
];

app.use(
    cors({
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(express.json({ limit: "2mb" }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/gemini", geminiRoutes);

// Serve React frontend
app.use(express.static(frontendDistPath));

// React page navigation fallback
app.use((req, res, next) => {
    if (
        req.method !== "GET" ||
        req.path === "/api" ||
        req.path.startsWith("/api/")
    ) {
        return next();
    }

    res.sendFile(path.join(frontendDistPath, "index.html"), (error) => {
        if (error) next(error);
    });
});

// API and other undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error("Server Error:", error.message);

    const status = error.status ||
        (error.code === "LIMIT_FILE_SIZE" ? 413 :
            error.code === 11000 ? 409 :
                error.name === "CastError" || error.name === "ValidationError" ? 400 : 500);
    res.status(status).json({
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