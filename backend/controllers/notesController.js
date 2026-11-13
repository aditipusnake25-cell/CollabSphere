import Note from "../models/Note.js";
import Project from "../models/Project.js";

const checkProjectAccess = async (projectId, userId) => {
    const project = await Project.findById(projectId);
    return project && project.members.some(id => id.toString() === userId.toString());
};

export const createNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const project = req.params.id;
        if (!title || !content || !project) return res.status(400).json({ success: false, message: "Title, content and project are required" });
        if (!(await checkProjectAccess(project, req.user.id))) return res.status(403).json({ success: false, message: "You cannot add notes to this project" });
        const note = await Note.create({ title, content, project, createdBy: req.user.id });
        res.status(201).json({ success: true, message: "Note created", note });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getProjectNotes = async (req, res) => {
    try {
        if (!(await checkProjectAccess(req.params.id, req.user.id))) return res.status(403).json({ success: false, message: "You cannot view these notes" });
        const notes = await Note.find({ project: req.params.id }).populate("createdBy", "name").sort({ createdAt: -1 });
        res.json({ success: true, notes });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const updateNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ success: false, message: "Note not found" });
        if (!(await checkProjectAccess(note.project, req.user.id))) return res.status(403).json({ success: false, message: "Access denied" });
        const project = await Project.findById(note.project);
        if (note.createdBy.toString() !== req.user.id && project.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Only the note creator or project owner can edit it" });
        }
        if (req.body.title !== undefined) note.title = req.body.title;
        if (req.body.content !== undefined) note.content = req.body.content;
        await note.save();
        res.json({ success: true, message: "Note updated", note });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ success: false, message: "Note not found" });
        if (!(await checkProjectAccess(note.project, req.user.id))) return res.status(403).json({ success: false, message: "Access denied" });
        const project = await Project.findById(note.project);
        if (note.createdBy.toString() !== req.user.id && project.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Only the note creator or project owner can delete it" });
        }
        await note.deleteOne();
        res.json({ success: true, message: "Note deleted" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
