import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    technology: { type: [String], default: [] },
    status: { type: String, enum: ["Planning", "In Progress", "Completed"], default: "Planning" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isPublic: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);
