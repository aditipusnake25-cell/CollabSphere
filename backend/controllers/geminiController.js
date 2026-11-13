import { GoogleGenAI } from "@google/genai";

const generateAIResponse = async (req, res, task) => {
    try {
        const { content, action } = req.body;
        if (typeof content !== "string" || !content.trim()) return res.status(400).json({ success: false, message: "Please provide content" });
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "add_your_gemini_api_key_here") {
            return res.status(503).json({ success: false, message: "Add your Gemini API key to Backend/.env first" });
        }

        const prompts = {
            explain: action === "improve"
                ? `Suggest clear, practical improvements to the following note. Explain why each suggestion would help, and do not claim changes were applied:\n\n${content}`
                : `Explain the following code or notes in simple beginner-friendly language. Include the purpose and a step-by-step explanation:\n\n${content}`,
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


export const checkGeminiStatus = async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "add_your_gemini_api_key_here") {
        return res.status(503).json({
            success: false,
            configured: false,
            connected: false,
            message: "Gemini API key is not configured on the backend."
        });
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Reply with OK only."
        });

        return res.json({
            success: true,
            configured: true,
            connected: true,
            message: "Gemini API is configured and responding."
        });
    } catch (error) {
        console.error("Gemini connection check failed:", error.message);

        return res.status(502).json({
            success: false,
            configured: true,
            connected: false,
            message: "The API key is present, but Gemini could not be reached. Check the key, API access, or quota."
        });
    }
};
