"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleImageUpload = exports.uploadImages = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const multerConfig_1 = __importDefault(require("../config/multerConfig"));
// Function to upload a single image to Cloudinary
const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.default.uploader.upload_stream({
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
        }, (error, result) => {
            if (error)
                reject(error);
            else
                resolve(result.secure_url);
        });
        uploadStream.end(file.buffer);
    });
};
// Middleware for handling multiple file uploads
const uploadImages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }
        const uploadPromises = files.map((file) => uploadToCloudinary(file));
        const imageUrls = yield Promise.all(uploadPromises);
        req.body.imageUrls = imageUrls; // Attach the image URLs to the request body
        next();
    }
    catch (error) {
        console.error("Error uploading images to Cloudinary:", error);
        res.status(500).json({ error: "Failed to upload images" });
    }
});
exports.uploadImages = uploadImages;
// Middleware chain: multer upload followed by Cloudinary upload
exports.handleImageUpload = [
    multerConfig_1.default.array("images", 10), // 'images' is the field name, 10 is max number of files
    exports.uploadImages,
];
