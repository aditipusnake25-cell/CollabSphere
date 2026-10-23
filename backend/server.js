import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import authMiddleware from "./middleware/authMiddleware.js";
import projectRoutes from './routes/projectRoutes.js';
import noteRoutes from './routes/noteRoutes.js'
import fileRoutes from './routes/fileRoutes.js'
import geminiRoutes from './routes/geminiRoutes.js'

dotenv.config()

const app = express()

app.use(express.json())

const PORT = process.env.PORT || 5000

app.use("/api/auth", authRoutes)

app.use("/api", noteRoutes);

app.use("/api/projects", projectRoutes)

app.use("/api/files", fileRoutes)

app.use("/api/ai",geminiRoutes)

app.get("/api/auth/profile", authMiddleware, (req, res) => {
    res.json({
        message: "You are logged in successfully!",
        user: req.user
    });
});

const startServer = async () => {
    try {
        await connectDB()
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (error) {
        console.log("Connection error: ", error.message);

    }
}

startServer()
