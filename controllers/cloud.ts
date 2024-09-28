import axios from "axios";
import { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const cloudName = process.env.CLOUDINARY_CLOUD_NAME; // Cloudinary cloud name
const apiKey = process.env.CLOUDINARY_API_KEY; // Cloudinary API key
const apiSecret = process.env.CLOUDINARY_API_SECRET; // Cloudinary API secret

// Controller function to get folder names
export const getFolders = async (req: Request, res: Response) => {
  const base64EncodedAuthString = Buffer.from(
    `${apiKey}:${apiSecret}`
  ).toString("base64");

  try {
    const response: any = await axios.get(
      `https://api.cloudinary.com/v1_1/${cloudName}/folders`,
      {
        headers: {
          Authorization: `Basic ${base64EncodedAuthString}`,
        },
      }
    );

    const folders = response.data.folders; // This will contain the list of folders
    res.status(200).json({ folders }); // Send folders as response
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({ error: "Failed to fetch folders." });
  }
};
