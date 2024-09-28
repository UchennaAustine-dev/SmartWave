import multer from "multer";
import { Request } from "express";

// Multer configuration using memory storage
const storage = multer.memoryStorage();

// Custom file filter function
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."));
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // 5MB file size limit, max 10 files
});

export default upload;
