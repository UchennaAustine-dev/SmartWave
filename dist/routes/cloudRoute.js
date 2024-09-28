"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cloud_1 = require("../controllers/cloud");
const router = (0, express_1.Router)();
// Route to get folder names from Cloudinary
router.get("/folders", cloud_1.getFolders);
exports.default = router;
