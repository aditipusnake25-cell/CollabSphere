import { GoogleGenAI } from "@google/genai";

const generateAIResponse = async (req, res, task) => {
    try {
        const { content } = req.body;
        if (!content?.trim()) return res.status(400).json({ success: false, message: "Please provide content" });
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "add_your_gemini_api_key_here") {
            return res.status(503).json({ success: false, message: "Add your Gemini API key to Backend/.env first" });
        }

        const prompts = {
            explain: `Explain the following code or notes in simple beginner-friendly language. Include the purpose and a step-by-step explanation:\n\n${content}`,
            docs: `Create clear technical documentation for the following code or project content. Use headings and explain important parts:\n\n${content}`,
            readme: `Create a professional README.md for the following project information. Include overview, features, technologies, installation, usage and project structure where possible:\n\n${content}`
        };

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompts[task]
        });
        res.json({ success: true, result: response.text || "No response generated" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const explainContent = (req, res) => generateAIResponse(req, res, "explain");
export const generateDocs = (req, res) => generateAIResponse(req, res, "docs");
export const generateReadme = (req, res) => generateAIResponse(req, res, "readme");
