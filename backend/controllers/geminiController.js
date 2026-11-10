// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({
//     apiKey:process.env.GEMINI_API_KEY
// })

// const explainCode = async (req,res) => {
//     try {
//         const {code} = req.body
//         if(!code || typeof code !=="string" || !code.trim()){
//             return res.status(400).json({
//                 message:"Please provide code to explain."
//             })
//         }
//         const response = await ai.models.generateContent({
//             model:"gemini-3.8-flash",
//             contents:`Explain this code in simple English. Explain what is does , how it works , and its important functions. code: ${code}`
//         })
//         return res.status(200).json({
//             message:"Code explained sucessfully!",
//             explanation:response.text
//         })
//     } catch (error) {
//         console.error("Explanation error: ",error.message);

//         return res.status(500).json({
//             message:"Failed to explain code."
//         })
//     }
// }

// export {explainCode}




import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import File from "../models/File.js";
import Note from "../models/Note.js";
import Project from "../models/Project.js";

const apiKey = process.env.GEMINI_API_KEY;
const uploadsDirectory = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../uploads"
);
const codeExtensions = new Set([".js", ".jsx", ".py", ".java", ".html", ".css", ".json"]);

const ai = apiKey ? new GoogleGenAI({
    apiKey: apiKey,
    vertexai: false
}) : null;

const getProjectContext = async (projectId, userId) => {
    if (!projectId || !mongoose.isValidObjectId(projectId)) {
        return { status: 400, message: "A valid projectId is required." };
    }

    const project = await Project.findById(projectId);
    if (!project) {
        return { status: 404, message: "Project not found." };
    }

    const isMember = project.createdBy.toString() === userId.toString() ||
        project.members.some((memberId) => memberId.toString() === userId.toString());
    if (!isMember) {
        return { status: 403, message: "You are not a member of this project." };
    }

    const [notes, files] = await Promise.all([
        Note.find({ project: projectId }).sort({ createdAt: -1 }).limit(30),
        File.find({ project: projectId }).sort({ createdAt: -1 }).limit(30)
    ]);

    const codeFiles = files.filter((file) =>
        codeExtensions.has(path.extname(file.originalName).toLowerCase())
    ).slice(0, 5);
    let remainingCodeCharacters = 30000;
    const fileContents = [];
    for (const file of codeFiles) {
        if (remainingCodeCharacters <= 0) break;
        const content = await readFile(
            path.join(uploadsDirectory, path.basename(file.storedName)),
            "utf8"
        );
        const excerpt = content.slice(0, remainingCodeCharacters);
        remainingCodeCharacters -= excerpt.length;
        fileContents.push(`File: ${file.originalName}\n${excerpt}`);
    }

    return {
        project,
        notes: notes.map(({ title, content }) => ({ title, content: content.slice(0, 2000) })),
        files,
        code: fileContents.join("\n\n")
    };
};

const explainCode = async (req, res) => {
    try {
        if (!ai) {
            return res.status(503).json({ message: "Gemini API is not configured." });
        }

        const { code, text, task, fileName } = req.body;
        const source = typeof code === "string" ? code : text;

        if (typeof source !== "string" || !source.trim()) {
            return res.status(400).json({ message: "Please provide content to explain." });
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: task === "improve"
                ? `Suggest clear, actionable improvements to the following note. Preserve its meaning, point out missing details, and provide an improved version. Do not invent project facts.

Note:
${source}`
                : `Explain the following ${typeof code === "string" ? "code" : "note"} in simple English.

FORMATTING RULES:
- Return plain text only.
- Do not use Markdown.
- Use simple section titles on separate lines.
- Do not invent details.

${fileName ? `File name: ${fileName}\n` : ""}
Content:
${source}`
        });

        return res.status(200).json({
            message: "Content processed successfully.",
            explanation: response.text
        });

    } catch (error) {
        console.error("Explanation error:", error);

        return res.status(500).json({
            message: "Failed to explain code.",
            error: error.message
        });
    }
};


const generateReadme = async (req, res) => {
    try {
        if (!ai) {
            return res.status(503).json({ message: "Gemini API is not configured." });
        }

        const context = await getProjectContext(req.body.projectId, req.user.id);
        if (context.status) {
            return res.status(context.status).json({ message: context.message });
        }

        if (context.project.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                message: "Only the project owner can generate and save its README."
            });
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a useful README in Markdown using only the supplied project data. Do not invent commands, endpoints, dependencies, environment variables, or features. If information is unavailable, state that it was not provided.

Project: ${context.project.name}
Description: ${context.project.description}
Technologies: ${context.project.technology.join(", ") || "Not provided"}
Notes:
${context.notes.map((note) => `${note.title}\n${note.content}`).join("\n\n") || "No notes"}
Project code files:
${context.code || "No supported code files were uploaded"}
Other project files: ${context.files.map((file) => file.originalName).join(", ") || "None"}`
        });

        context.project.readme = response.text || "";
        await context.project.save();

        return res.status(200).json({
            message: "README generated successfully!",
            readme: context.project.readme,
            projectId: context.project.id
        });

    } catch (error) {
        console.error("Generate README error:", error);

        return res.status(500).json({
            message: "Failed to generate README.",
            error: error.message
        });
    }
};

const generateDocumentation = async (req, res) => {
    try {
        if (!ai) {
            return res.status(503).json({ message: "Gemini API is not configured." });
        }

        const context = await getProjectContext(req.body.projectId, req.user.id);
        if (context.status) {
            return res.status(context.status).json({ message: context.message });
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate technical documentation in Markdown using only the supplied project data. Explain the project purpose, technologies, available notes, code files and key behavior. Do not invent functions, commands, endpoints, or details. Mark unavailable information as not provided.

Project: ${context.project.name}
Description: ${context.project.description}
Technologies: ${context.project.technology.join(", ") || "Not provided"}
Notes:
${context.notes.map((note) => `${note.title}\n${note.content}`).join("\n\n") || "No notes"}
Code files:
${context.code || "No supported code files were uploaded"}
Other files: ${context.files.map((file) => file.originalName).join(", ") || "None"}`
        });

        return res.status(200).json({
            message: "Documentation generated successfully!",
            documentation: response.text,
            projectId: context.project.id
        });

    } catch (error) {
        console.error("Generate documentation error:", error);

        return res.status(500).json({
            message: "Failed to generate documentation.",
            error: error.message
        });
    }
};


export { explainCode, generateReadme, generateDocumentation }
