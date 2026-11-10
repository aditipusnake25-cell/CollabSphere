import express from "express";

import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjectMember,
    getPublicProject
} from "../controllers/projectController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/public/:id", getPublicProject);
router.use(authMiddleware);

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

// Team members
router.post("/:id/members", addProjectMember);
router.delete("/:id/members/:memberId", removeProjectMember);

export default router;