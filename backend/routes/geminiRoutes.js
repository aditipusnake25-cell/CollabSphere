import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    explainContent,
    generateDocs,
    generateReadme,
    checkGeminiStatus
} from "../controllers/geminiController.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/status", checkGeminiStatus);\nrouter.post("/explain", explainContent);
router.post("/docs", generateDocs);
router.post("/readme", generateReadme);
export default router;
