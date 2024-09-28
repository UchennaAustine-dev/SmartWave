import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import upload from "../config/multerConfig";

// Function to upload a single image to Cloudinary
const uploadToCloudinary = (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "samples", // Change this to your desired folder name in Cloudinary
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
