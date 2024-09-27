import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

// Function to upload a single image to Cloudinary
const uploadToCloudinary = (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "your_folder_name", // Change this to your desired folder name in Cloudinary
        allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
        transformation: [
          { width: 1000, height: 1000, crop: "limit" },
          { quality: "auto:good", fetch_format: "auto" },
        ],
        eager: [
          { width: 300, height: 300, crop: "fill", gravity: "auto" },
          { width: 600, height: 600, crop: "fill", gravity: "auto" },
        ],
        eager_async: true,
        eager_notification_url: process.env.CLOUDINARY_NOTIFICATION_URL, // Optional: set up a webhook for processing notifications
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );
    uploadStream.end(file.buffer);
  });
};

// Middleware for handling multiple file uploads
export const uploadImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadPromises = files.map((file) => uploadToCloudinary(file));
    const imageUrls = await Promise.all(uploadPromises);

    req.body.imageUrls = imageUrls; // Attach the image URLs to the request body
    next();
  } catch (error) {
    console.error("Error uploading images to Cloudinary:", error);
    res.status(500).json({ error: "Failed to upload images" });
  }
};

// Middleware chain: multer upload followed by Cloudinary upload
export const handleImageUpload = [
  upload.array("images", 10), // 'images' is the field name, 10 is max number of files
  uploadImages,
];
