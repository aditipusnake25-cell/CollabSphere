
import express from "express";

import {
  createNote,
  getProjectNotes
} from "../controllers/noteController.js";

import authMiddleware  from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/projects/:id/notes",  authMiddleware, createNote);

router.get("/projects/:id/notes",  authMiddleware, getProjectNotes);

export default router;
