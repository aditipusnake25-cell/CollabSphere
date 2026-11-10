import { unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import File from "../models/File.js";
import Project from "../models/Project.js";

const uploadsDirectory = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../uploads"
);

const isProjectMember = (project, userId) =>
    project.createdBy.toString() === userId.toString() ||
    project.members.some((memberId) => memberId.toString() === userId.toString());

const getProjectForMember = async (projectId, userId, res) => {
    if (!mongoose.isValidObjectId(projectId)) {
        res.status(404).json({ message: "Project not found." });
        return null;
    }

    const project = await Project.findById(projectId);

    if (!project) {
        res.status(404).json({ message: "Project not found." });
        return null;
    }

    if (!isProjectMember(project, userId)) {
        res.status(403).json({ message: "You are not a member of this project." });
        return null;
    }

    return project;
};

const authorizeProjectFileUpload = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({ message: "Project not found." });
        }
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }
        if (!isProjectMember(project, req.user.id)) {
            return res.status(403).json({ message: "You are not a member of this project." });
        }
        return next();
    } catch (error) {
        console.error("Authorize project file upload error:", error);
        return res.status(500).json({
            message: "Unable to verify project access.",
            error: error.message
        });
    }
};

const uploadFile = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await getProjectForMember(id, req.user.id, res);
        if (!project) return;

        if (!req.file) {
            return res.status(400).json({ message: "Please select a file to upload." });
        }

        const file = new File({
            originalName: req.file.originalname,
            storedName: req.file.filename,
            fileUrl: "pending",
            mimeType: req.file.mimetype || "application/octet-stream",
            size: req.file.size,
            project: id,
            uploadedBy: req.user.id
        });

        file.fileUrl = `/api/files/${id}/files/${file._id}/content`;
        await file.save();

        return res.status(201).json({
            message: "File uploaded successfully.",
            file
        });
    } catch (error) {
        console.error("File upload error:", error);
        if (req.file?.path) {
            try {
                await unlink(req.file.path);
            } catch (cleanupError) {
                if (cleanupError.code !== "ENOENT") {
                    console.error("Failed to remove an unrecorded upload:", cleanupError);
                }
            }
        }
        return res.status(500).json({
            message: "Failed to upload file.",
            error: error.message
        });
    }
};

const getProjectFiles = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await getProjectForMember(id, req.user.id, res);
        if (!project) return;

        const files = await File.find({ project: id })
            .populate("uploadedBy", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Project files fetched successfully.",
            files: files.map((file) => ({
                ...file.toObject(),
                fileUrl: `/api/files/${id}/files/${file._id}/content`
            }))
        });
    } catch (error) {
        console.error("Get project files error:", error);
        return res.status(500).json({
            message: "Failed to fetch project files.",
            error: error.message
        });
    }
};

const getProjectFileContent = async (req, res) => {
    try {
        const { id, fileId } = req.params;
        if (!mongoose.isValidObjectId(fileId)) {
            return res.status(404).json({ message: "File not found." });
        }
        const project = await getProjectForMember(id, req.user.id, res);
        if (!project) return;

        const file = await File.findOne({ _id: fileId, project: id });
        if (!file) {
            return res.status(404).json({ message: "File not found." });
        }

        const storedName = path.basename(file.storedName);
        const filePath = path.join(uploadsDirectory, storedName);
        const extension = path.extname(file.originalName).toLowerCase();
        const imageMimeTypes = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".webp": "image/webp"
        };
        const imageMimeType = imageMimeTypes[extension];
        const isPdf = extension === ".pdf";
        const isZip = extension === ".zip";

        res.set("X-Content-Type-Options", "nosniff");
        res.type(imageMimeType || (isPdf ? "application/pdf" : isZip ? "application/octet-stream" : "text/plain"));
        res.set("Content-Disposition", isZip ? "attachment" : "inline");
        return res.sendFile(filePath);
    } catch (error) {
        console.error("Get project file content error:", error);
        return res.status(500).json({
            message: "Failed to retrieve file content.",
            error: error.message
        });
    }
};

const deleteProjectFile = async (req, res) => {
    try {
        const { id, fileId } = req.params;
        if (!mongoose.isValidObjectId(fileId)) {
            return res.status(404).json({ message: "File not found." });
        }
        const project = await getProjectForMember(id, req.user.id, res);
        if (!project) return;

        const file = await File.findOne({ _id: fileId, project: id });
        if (!file) {
            return res.status(404).json({ message: "File not found." });
        }

        const isOwner = project.createdBy.toString() === req.user.id.toString();
        const isUploader = file.uploadedBy.toString() === req.user.id.toString();
        if (!isOwner && !isUploader) {
            return res.status(403).json({
                message: "Only the uploader or project owner can delete this file."
            });
        }

        try {
            await unlink(path.join(uploadsDirectory, path.basename(file.storedName)));
        } catch (error) {
            if (error.code !== "ENOENT") throw error;
        }

        await file.deleteOne();
        return res.status(200).json({ message: "File deleted successfully." });
    } catch (error) {
        console.error("Delete project file error:", error);
        return res.status(500).json({
            message: "Failed to delete file.",
            error: error.message
        });
    }
};

export {
    uploadFile,
    getProjectFiles,
    getProjectFileContent,
    deleteProjectFile,
    authorizeProjectFileUpload
};
