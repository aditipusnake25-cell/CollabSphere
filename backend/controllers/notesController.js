import Note from "../models/Note.js";
import Project from "../models/Project.js";
import mongoose from "mongoose";

const isProjectMember = (project, userId) =>
    project.createdBy.toString() === userId.toString() ||
    project.members.some((memberId) => memberId.toString() === userId.toString());

const canManageNote = (note, project, userId) =>
    note.createdBy.toString() === userId.toString() ||
    project.createdBy.toString() === userId.toString();

const createNote = async (req, res) => {
    try {
        const { title, content = "" } = req.body || {};
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({ message: "Project not found." });
        }
        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({ message: "Note title is required." });
        }

        if (typeof content !== "string") {
            return res.status(400).json({ message: "Note content must be text." });
        }

        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }
        if (!isProjectMember(project, req.user.id)) {
            return res.status(403).json({ message: "You are not a member of this project." });
        }

        const note = await Note.create({
            title: title.trim(),
            content,
            project: id,
            createdBy: req.user.id
        });

        return res.status(201).json({
            message: "Note created successfully.",
            note
        });
    } catch (error) {
        console.error("Create note error:", error);
        return res.status(500).json({
            message: "Failed to create note.",
            error: error.message
        });
    }
};

const getProjectNotes = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({ message: "Project not found." });
        }
        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }
        if (!isProjectMember(project, req.user.id)) {
            return res.status(403).json({ message: "You are not a member of this project." });
        }

        const notes = await Note.find({ project: id })
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({ count: notes.length, notes });
    } catch (error) {
        console.error("Get project notes error:", error);
        return res.status(500).json({
            message: "Failed to retrieve notes.",
            error: error.message
        });
    }
};

const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, isPublic } = req.body || {};
        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({ message: "Note not found." });
        }
        const note = await Note.findById(id);

        if (!note) {
            return res.status(404).json({ message: "Note not found." });
        }

        const project = await Project.findById(note.project);
        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }
        if (!isProjectMember(project, req.user.id)) {
            return res.status(403).json({ message: "You are not a member of this project." });
        }
        if (!canManageNote(note, project, req.user.id)) {
            return res.status(403).json({ message: "Only the note author or project owner can edit this note." });
        }

        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).json({ message: "Note title cannot be empty." });
            }
            note.title = title.trim();
        }
        if (content !== undefined) {
            if (typeof content !== "string") {
                return res.status(400).json({ message: "Note content must be text." });
            }
            note.content = content;
        }
        if (isPublic !== undefined) {
            if (typeof isPublic !== "boolean") {
                return res.status(400).json({ message: "Note visibility must be a boolean." });
            }
            note.isPublic = isPublic;
        }

        await note.save();
        return res.status(200).json({ message: "Note updated successfully.", note });
    } catch (error) {
        console.error("Update note error:", error);
        return res.status(500).json({
            message: "Failed to update note.",
            error: error.message
        });
    }
};

const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({ message: "Note not found." });
        }
        const note = await Note.findById(id);

        if (!note) {
            return res.status(404).json({ message: "Note not found." });
        }

        const project = await Project.findById(note.project);
        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }
        if (!isProjectMember(project, req.user.id)) {
            return res.status(403).json({ message: "You are not a member of this project." });
        }
        if (!canManageNote(note, project, req.user.id)) {
            return res.status(403).json({ message: "Only the note author or project owner can delete this note." });
        }

        await note.deleteOne();
        return res.status(200).json({ message: "Note deleted successfully." });
    } catch (error) {
        console.error("Delete note error:", error);
        return res.status(500).json({
            message: "Failed to delete note.",
            error: error.message
        });
    }
};

export { createNote, getProjectNotes, updateNote, deleteNote };