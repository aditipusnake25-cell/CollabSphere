import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Please login first" });
        }
        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.status(401).json({ success: false, message: "User not found" });
        req.user = { id: user._id.toString(), name: user.name, email: user.email };
        next();
    } catch {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

export default authMiddleware;
