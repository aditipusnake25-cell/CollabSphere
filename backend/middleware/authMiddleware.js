import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Please login first" });
    }

    let decoded;
    try {
        const token = header.split(" ")[1];
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || typeof decoded !== "object" || !decoded.id) {
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }
    } catch {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    try {
        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.status(401).json({ success: false, message: "User not found" });
        req.user = { id: user._id.toString(), name: user.name, email: user.email };
        next();
    } catch (error) {
        console.error("Authentication lookup failed:", error.message);
        return res.status(500).json({ success: false, message: "Unable to verify your session" });
    }
};

export default authMiddleware;
