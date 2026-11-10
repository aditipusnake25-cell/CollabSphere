import fs from "fs/promises";
import path from "path";
import File from "../models/File.js";
import Project from "../models/Project.js";

const canAccessProject = async (projectId, userId) => {
    const project = await Project.findById(projectId);
    return project && project.members.some(id => id.toString() === userId.toString());
};

export const uploadFile = async (req, res) => {
    try {
        const { projectId } = req.params;
        if (!(await canAccessProject(projectId, req.user.id))) {
            if (req.file) await fs.unlink(req.file.path).catch(() => { });
            return res.status(403).json({ success: false, message: "You cannot upload to this project" });
        }
        if (!req.file) return res.status(400).json({ success: false, message: "Please select a file" });
        const file = await File.create({
            originalName: req.file.originalname,
            storedName: req.file.filename,
            fileUrl: `/uploads/${req.file.filename}`,
            mimeType: req.file.mimetype,
            size: req.file.size,
            project: projectId,
            uploadedBy: req.user.id
        });
        res.status(201).json({ success: true, message: "File uploaded", file });
    } catch (error) {
        if (req.file) await fs.unlink(req.file.path).catch(() => { });
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getProjectFiles = async (req, res) => {
    try {
        if (!(await canAccessProject(req.params.projectId, req.user.id))) return res.status(403).json({ success: false, message: "Access denied" });
        const files = await File.find({ project: req.params.projectId }).sort({ createdAt: -1 });
        res.json({ success: true, files });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const deleteFile = async (req, res) => {
    try {
        const file = await File.findOne({ _id: req.params.fileId, project: req.params.projectId });
        if (!file) return res.status(404).json({ success: false, message: "File not found" });
        if (file.uploadedBy.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Only the uploader can delete this file" });
        const filePath = path.join(process.cwd(), "uploads", file.storedName);
        await fs.unlink(filePath).catch(() => { });
        await file.deleteOne();
        res.json({ success: true, message: "File deleted" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
