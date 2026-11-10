import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { explainContent, generateDocs, generateReadme } from "../controllers/geminiController.js";

const router = express.Router();
router.use(authMiddleware);
router.post("/explain", explainContent);
router.post("/docs", generateDocs);
router.post("/readme", generateReadme);
export default router;
