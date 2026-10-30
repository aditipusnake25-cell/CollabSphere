import Project from "../models/Project.js";
import User from "../models/User.js";
import Note from "../models/Note.js";

const isMember = (project, userId) => project.members.some(member => member.toString() === userId.toString());

export const createProject = async (req, res) => {
    try {
        const { name, description, technology = [], status = "Planning" } = req.body;
        if (!name || !description) return res.status(400).json({ success: false, message: "Project name and description are required" });
        const project = await Project.create({ name, description, technology, status, createdBy: req.user.id, members: [req.user.id] });
        res.status(201).json({ success: true, message: "Project created", project });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ members: req.user.id }).populate("createdBy", "name email").populate("members", "name email").sort({ createdAt: -1 });
        res.json({ success: true, count: projects.length, projects });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate("createdBy", "name email").populate("members", "name email");
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });
        if (!isMember(project, req.user.id)) return res.status(403).json({ success: false, message: "You are not a project member" });
        res.json({ success: true, project });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });
        if (project.createdBy.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Only the creator can update this project" });
        const allowed = ["name", "description", "technology", "status", "isPublic"];
        allowed.forEach(key => { if (req.body[key] !== undefined) project[key] = req.body[key]; });
        await project.save();
        res.json({ success: true, message: "Project updated", project });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });
        if (project.createdBy.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Only the creator can delete this project" });
        await Promise.all([Note.deleteMany({ project: project._id }), project.deleteOne()]);
        res.json({ success: true, message: "Project deleted" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const addProjectMember = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });
        if (project.createdBy.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Only the creator can add members" });
        const email = req.body.email?.toLowerCase().trim();
        if (!email) return res.status(400).json({ success: false, message: "Member email is required" });
        const member = await User.findOne({ email });
        if (!member) return res.status(404).json({ success: false, message: "User with this email does not exist" });
        if (isMember(project, member._id)) return res.status(409).json({ success: false, message: "User is already a member" });
        project.members.push(member._id);
        await project.save();
        await project.populate("members", "name email");
        res.json({ success: true, message: "Member added", members: project.members });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const removeProjectMember = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });
        if (project.createdBy.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Only the creator can remove members" });
        if (project.createdBy.toString() === req.params.memberId) return res.status(400).json({ success: false, message: "Project creator cannot be removed" });
        project.members = project.members.filter(id => id.toString() !== req.params.memberId);
        await project.save();
        res.json({ success: true, message: "Member removed" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getPublicProject = async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, isPublic: true }).populate("members", "name");
        if (!project) return res.status(404).json({ success: false, message: "Public project not found" });
        const notes = await Note.find({ project: project._id }).select("title content createdAt");
        res.json({ success: true, project: { ...project.toObject(), notes } });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
