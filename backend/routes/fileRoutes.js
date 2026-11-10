import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
    uploadFile,
    getProjectFiles,
    getProjectFileContent,
    deleteProjectFile,
    authorizeProjectFileUpload
} from "../controllers/fileController.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
    "/:id/files",
    authMiddleware,
    authorizeProjectFileUpload,
    upload.single("file"),
    uploadFile
);

router.get("/:id/files", authMiddleware, getProjectFiles);

router.get("/:id/files/:fileId/content", authMiddleware, getProjectFileContent);

router.delete("/:id/files/:fileId", authMiddleware, deleteProjectFile);

export default router;