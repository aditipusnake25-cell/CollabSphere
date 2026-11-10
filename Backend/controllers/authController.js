import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ success: false, message: "Please fill all fields" });
        if (password.length < 6) return res.status(400).json({ success: false, message: "Password must contain at least 6 characters" });

        const normalizedEmail = email.toLowerCase().trim();
        if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ success: false, message: "User already exists" });

        const user = await User.create({ name, email: normalizedEmail, password: await bcrypt.hash(password, 12) });
        res.status(201).json({
            success: true, message: "User registered successfully",
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }
        res.json({
            success: true, message: "Login successful",
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getProfile = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
};
