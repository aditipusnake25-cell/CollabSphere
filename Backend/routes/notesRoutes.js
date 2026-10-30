import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createNote, getProjectNotes, updateNote, deleteNote } from "../controllers/notesController.js";

const router = express.Router();
router.use(authMiddleware);
router.post("/", createNote);
router.get("/project/:projectId", getProjectNotes);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
export default router;
