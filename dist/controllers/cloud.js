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
exports.getFolders = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME; // Cloudinary cloud name
const apiKey = process.env.CLOUDINARY_API_KEY; // Cloudinary API key
const apiSecret = process.env.CLOUDINARY_API_SECRET; // Cloudinary API secret
// Controller function to get folder names
const getFolders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const base64EncodedAuthString = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    try {
        const response = yield axios_1.default.get(`https://api.cloudinary.com/v1_1/${cloudName}/folders`, {
            headers: {
                Authorization: `Basic ${base64EncodedAuthString}`,
            },
        });
        const folders = response.data.folders; // This will contain the list of folders
        res.status(200).json({ folders }); // Send folders as response
    }
    catch (error) {
        console.error("Error fetching folders:", error);
        res.status(500).json({ error: "Failed to fetch folders." });
    }
});
exports.getFolders = getFolders;
