import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error("MONGODB_URI is not configured.");
        }

        await mongoose.connect(mongoUri);

        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;
