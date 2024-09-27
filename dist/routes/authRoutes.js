"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
// User registration routes
router.post("/register/affiliate", authController_1.registerAffiliateUser);
router.post("/register/vendor", authController_1.registerVendorUser);
router.post("/verify-email", authController_1.verifyEmail);
router.post("/send-verification-email", authController_1.sendVerification);
router.post("/login", authController_1.loginUser);
// Route for deleting a user by ID
router.delete("/delete-user/:userId", authController_1.deleteUserById);
exports.default = router;
