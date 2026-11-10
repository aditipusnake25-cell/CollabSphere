import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    createProject, getProjects, getProjectById, updateProject, deleteProject,
    addProjectMember, removeProjectMember, getPublicProject
} from "../controllers/projectController.js";

const router = express.Router();
router.get("/public/:id", getPublicProject);
router.use(authMiddleware);
router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.post("/:id/members", addProjectMember);
router.delete("/:id/members/:memberId", removeProjectMember);
export default router;
