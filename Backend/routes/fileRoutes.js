import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import { uploadFile, getProjectFiles, deleteFile } from "../controllers/fileController.js";

const router = express.Router();
router.use(authMiddleware);
router.post("/:projectId", uploadMiddleware.single("file"), uploadFile);
router.get("/project/:projectId", getProjectFiles);
router.delete("/:projectId/:fileId", deleteFile);
export default router;
