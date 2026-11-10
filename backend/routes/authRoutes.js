import express from "express";

import {
    registerUser,
    loginUser,
    getProfile
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get logged-in user profile
router.get("/profile", authMiddleware, getProfile);

export default router;