import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import File from "../models/File.js";
import Project from "../models/Project.js";

const uploadsDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../uploads");

const canAccessProject = async (projectId, userId) => {
    const project = await Project.findById(projectId);
    return project && project.members.some(id => id.toString() === userId.toString());
};

const getStoredFilePath = storedName => {
    const filePath = path.resolve(uploadsDirectory, storedName);
    return path.dirname(filePath) === uploadsDirectory ? filePath : null;
};

export const uploadFile = async (req, res) => {
    try {
        const { projectId } = req.params;
        if (!(await canAccessProject(projectId, req.user.id))) {
            if (req.file) await fs.unlink(req.file.path).catch(() => { });
            return res.status(403).json({ success: false, message: "You cannot upload to this project" });
        }
        if (!req.file) return res.status(400).json({ success: false, message: "Please select a file" });
        const file = new File({
            originalName: req.file.originalname,
            storedName: req.file.filename,
            fileUrl: "",
            mimeType: req.file.mimetype,
            size: req.file.size,
            project: projectId,
            uploadedBy: req.user.id
        });
        file.fileUrl = `/api/files/project/${projectId}/${file._id}/content`;
        await file.save();
        res.status(201).json({ success: true, message: "File uploaded", file });
    } catch (error) {
        if (req.file) await fs.unlink(req.file.path).catch(() => { });
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getProjectFiles = async (req, res) => {
    try {
        if (!(await canAccessProject(req.params.projectId, req.user.id))) return res.status(403).json({ success: false, message: "Access denied" });
        const files = await File.find({ project: req.params.projectId }).populate("uploadedBy", "name email").sort({ createdAt: -1 });
        res.json({ success: true, files });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getFileContent = async (req, res) => {
    try {
        const file = await File.findOne({ _id: req.params.fileId, project: req.params.projectId });
        if (!file) return res.status(404).json({ success: false, message: "File not found" });
        if (!(await canAccessProject(req.params.projectId, req.user.id))) return res.status(403).json({ success: false, message: "Access denied" });

        const filePath = getStoredFilePath(file.storedName);
        if (!filePath) return res.status(404).json({ success: false, message: "File content is unavailable" });
        res.set("X-Content-Type-Options", "nosniff");
        res.type(file.mimeType).sendFile(filePath, (error) => {
            if (error && !res.headersSent) {
                res.status(error.statusCode || 404).json({ success: false, message: "File content is unavailable" });
            }
        });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const deleteFile = async (req, res) => {
    try {
        const file = await File.findOne({ _id: req.params.fileId, project: req.params.projectId });
        if (!file) return res.status(404).json({ success: false, message: "File not found" });
        const project = await Project.findById(req.params.projectId);
        if (!project || !project.members.some(id => id.toString() === req.user.id)) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        if (file.uploadedBy.toString() !== req.user.id && project.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Only the uploader or project owner can delete this file" });
        }
        const filePath = getStoredFilePath(file.storedName);
        if (!filePath) return res.status(404).json({ success: false, message: "File content is unavailable" });
        try {
            await fs.unlink(filePath);
        } catch (error) {
            if (error.code !== "ENOENT") throw error;
        }
        await file.deleteOne();
        res.json({ success: true, message: "File deleted" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
