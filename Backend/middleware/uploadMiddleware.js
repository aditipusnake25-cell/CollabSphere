import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
});

const allowedExtensions = [".png", ".jpg", ".jpeg", ".gif", ".pdf", ".txt", ".md", ".js", ".jsx", ".html", ".css", ".json", ".py"];

const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(extension)) cb(null, true);
    else cb(new Error("File type is not supported"));
};

const uploadMiddleware = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

export default uploadMiddleware;
