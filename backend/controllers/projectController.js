import Project from "../models/Project.js";
import Note from "../models/Note.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const projectStatuses = ["Planning", "In Progress", "Completed"];
const isValidProjectId = (id) => mongoose.isValidObjectId(id);

// CREATE PROJECT
export const createProject = async (req, res) => {
    try {
        const { name, description, technology, status, isPublic } = req.body || {};
        const normalizedName = typeof name === "string" ? name.trim() : "";
        const normalizedDescription = typeof description === "string" ? description.trim() : "";

        if (!normalizedName || !normalizedDescription) {
            return res.status(400).json({
                success: false,
                message: "Project name and description are required"
            });
        }
        if (technology !== undefined &&
            (!Array.isArray(technology) || technology.some((item) => typeof item !== "string"))) {
            return res.status(400).json({
                success: false,
                message: "Technologies must be a list of text values"
            });
        }
        if (status !== undefined && !projectStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Project status is not supported"
            });
        }
        if (isPublic !== undefined && typeof isPublic !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "Project visibility must be a boolean"
            });
        }

        const project = await Project.create({
            name: normalizedName,
            description: normalizedDescription,
            technology: technology?.map((item) => item.trim()).filter(Boolean) || [],
            status: status || "Planning",
            isPublic: isPublic ?? false,
            createdBy: req.user.id,
            members: [req.user.id]
        });

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            project
        });

    } catch (error) {
        console.error("Create project error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to create project"
        });
    }
};


// GET ALL USER PROJECTS
export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            $or: [
                { members: req.user.id },
                { createdBy: req.user.id }
            ]
        })
            .populate("createdBy", "name email")
            .populate("members", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET A PUBLIC PROJECT WITHOUT RETURNING MEMBER OR FILE DETAILS
export const getPublicProject = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({
                success: false,
                message: "Public project not found"
            });
        }

        const project = await Project.findOne({ _id: id, isPublic: true })
            .select("name description technology status createdAt readme readmeIsPublic");

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Public project not found"
            });
        }

        const publicNotes = await Note.find({ project: id, isPublic: true })
            .select("title content createdAt")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            project: {
                ...project.toObject(),
                readme: project.readmeIsPublic ? project.readme : "",
                notes: publicNotes
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET SINGLE PROJECT
export const getProjectById = async (req, res) => {
    try {
        if (!isValidProjectId(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        const project = await Project.findById(req.params.id)
            .populate("createdBy", "name email")
            .populate("members", "name email");

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        const isMember =
            project.createdBy._id.toString() === req.user.id.toString() ||
            project.members.some(
                (member) => member._id.toString() === req.user.id.toString()
            );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this project"
            });
        }

        res.status(200).json({
            success: true,
            project
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// UPDATE PROJECT
export const updateProject = async (req, res) => {
    try {
        if (!isValidProjectId(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        const {
            name,
            description,
            technology,
            status,
            isPublic,
            readme,
            readmeIsPublic
        } = req.body || {};

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        if (project.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only the project creator can update this project"
            });
        }

        if (name !== undefined) {
            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({ message: "Project name cannot be empty." });
            }
            project.name = name.trim();
        }
        if (description !== undefined) {
            if (typeof description !== "string" || !description.trim()) {
                return res.status(400).json({ message: "Project description cannot be empty." });
            }
            project.description = description.trim();
        }
        if (technology !== undefined) {
            if (!Array.isArray(technology) || technology.some((item) => typeof item !== "string")) {
                return res.status(400).json({ message: "Technologies must be a list of text values." });
            }
            project.technology = technology.map((item) => item.trim()).filter(Boolean);
        }
        if (status !== undefined) {
            if (!projectStatuses.includes(status)) {
                return res.status(400).json({ message: "Project status is not supported." });
            }
            project.status = status;
        }
        if (isPublic !== undefined) {
            if (typeof isPublic !== "boolean") {
                return res.status(400).json({ message: "Project visibility must be a boolean." });
            }
            project.isPublic = isPublic;
        }
        if (readme !== undefined) {
            if (typeof readme !== "string") {
                return res.status(400).json({ message: "README content must be text." });
            }
            project.readme = readme;
        }
        if (readmeIsPublic !== undefined) {
            if (typeof readmeIsPublic !== "boolean") {
                return res.status(400).json({ message: "README visibility must be a boolean." });
            }
            project.readmeIsPublic = readmeIsPublic;
        }

        await project.save();

        res.status(200).json({
            success: true,
            message: "Project updated successfully",
            project
        });

    } catch (error) {
        console.error("Update project error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to update project"
        });
    }
};


// DELETE PROJECT
export const deleteProject = async (req, res) => {
    try {
        if (!isValidProjectId(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        if (project.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only the project creator can delete this project"
            });
        }

        await project.deleteOne();

        res.status(200).json({
            success: true,
            message: "Project deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ADD TEAM MEMBER
export const addProjectMember = async (req, res) => {
    try {
        if (!isValidProjectId(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        const email = typeof req.body?.email === "string"
            ? req.body.email.trim().toLowerCase()
            : "";

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Member email is required"
            });
        }

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        if (project.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only the project creator can add members"
            });
        }

        const member = await User.findOne({ email });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "User with this email does not exist"
            });
        }

        if (project.members.some(
            (id) => id.toString() === member._id.toString()
        )) {
            return res.status(400).json({
                success: false,
                message: "User is already a project member"
            });
        }

        project.members.push(member._id);

        await project.save();

        await project.populate("members", "name email");

        res.status(200).json({
            success: true,
            message: "Team member added successfully",
            members: project.members
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// REMOVE TEAM MEMBER
export const removeProjectMember = async (req, res) => {
    try {
        const { memberId } = req.params;
        if (!isValidProjectId(req.params.id) || !isValidProjectId(memberId)) {
            return res.status(404).json({
                success: false,
                message: "Project or member not found"
            });
        }

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        if (project.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only the project creator can remove members"
            });
        }

        if (memberId === project.createdBy.toString()) {
            return res.status(400).json({
                success: false,
                message: "Project creator cannot be removed"
            });
        }

        const memberExists = project.members.some(
            (id) => id.toString() === memberId
        );

        if (!memberExists) {
            return res.status(404).json({
                success: false,
                message: "Member not found in this project"
            });
        }

        project.members = project.members.filter(
            (id) => id.toString() !== memberId
        );

        await project.save();

        res.status(200).json({
            success: true,
            message: "Team member removed successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};