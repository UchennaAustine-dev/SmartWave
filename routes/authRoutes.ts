import { Router } from "express";
import {
  registerAffiliateUser,
  registerVendorUser,
  verifyEmail,
  sendVerification,
  loginUser,
  deleteUserById,
} from "../controllers/authController";

const router: Router = Router();

// User registration routes
router.post("/register/affiliate", registerAffiliateUser);
router.post("/register/vendor", registerVendorUser);
router.post("/verify-email", verifyEmail);
router.post("/send-verification-email", sendVerification);
router.post("/login", loginUser);
// Route for deleting a user by ID
router.delete("/delete-user/:userId", deleteUserById);

export default router;
