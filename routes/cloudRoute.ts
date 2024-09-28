import { Router } from "express";
import { getFolders } from "../controllers/cloud";

const router = Router();

// Route to get folder names from Cloudinary
router.get("/folders", getFolders);

export default router;
