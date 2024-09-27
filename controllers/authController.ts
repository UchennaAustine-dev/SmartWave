import { Request, Response } from "express";
// import { UserData } from "../utils/interface";
import {
  authenticateUser,
  registerAffiliate,
  registerVendor,
  verifyEmailToken,
} from "../models/userModel";
import dotenv from "dotenv";
import { MainAppError } from "../utils/errorUtils";
import { HTTPCODES } from "../utils/HTTPCODES";
import { regenerateOTP } from "../utils/emailUtils";
import { sendVerificationEmail } from "../models/functions/userModelFn";
import { doc, deleteDoc, getDoc } from "../config/firebase";
import { auth, db } from "../config/admin";

dotenv.config();

// Function to register an affiliate
export const registerAffiliateUser = async (req: Request, res: Response) => {
  const data: any = req.body;

  try {
    const user = await registerAffiliate(data); // Assuming registerAffiliate is defined elsewhere
    res
      .status(201)
      .json({ message: "Affiliate registered successfully", data: user });
  } catch (error: any) {
    console.error("Error registering affiliate:", error);
    res.status(error.httpcode || 500).json({ error: error.message });
  }
};

// Function to register a vendor
export const registerVendorUser = async (req: Request, res: Response) => {
  const data: any = req.body;

  try {
    const user = await registerVendor(data); // Assuming registerVendor is defined elsewhere
    res
      .status(201)
      .json({ message: "Vendor registered successfully", data: user });
  } catch (error: any) {
    console.error("Error registering vendor:", error);
    res.status(error.httpcode || 500).json({ error: error.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  try {
    const result = await verifyEmailToken(email, otp);
    res.json({ message: "Email verified successfully", result });
  } catch (error: any) {
    console.error("Error verifying email:", error);
    res.status(error.httpcode || 500).json({ error: error.message });
  }
};

export const sendVerification = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    await sendVerificationEmail(email);
    res.json({ message: "Verification email sent successfully" });
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    res.status(error.httpcode || 500).json({ error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    // Authenticate the user
    const authResponse = await authenticateUser(email, password);

    // Check if authResponse is defined
    if (!authResponse) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    const { user, token } = authResponse;

    // Return the user and token
    res.json({ message: "Login successful", token });
  } catch (error: any) {
    console.error("Error logging in user:", error);

    // Handle specific error cases
    if (error instanceof MainAppError) {
      res.status(error.httpcode).json({ error: error.message });
    } else {
      res
        .status(HTTPCODES.INTERNAL_SERVER_ERROR)
        .json({ error: "An error occurred while logging in" });
    }
  }
};

// Regenerate OTP Controller
export const regenerateOtpController = async (req: Request, res: Response) => {
  const { userId } = req.params; // Expecting userId request params
  const { email } = req.body; // Expecting userId and email in the request body

  if (!userId || !email) {
    return res.status(400).json({ error: "User ID and email are required." });
  }

  try {
    const newOtp = await regenerateOTP(userId, email);
    res
      .status(200)
      .json({ message: "New OTP sent successfully.", otp: newOtp });
  } catch (error) {
    console.error("Error regenerating OTP:", error);
    res
      .status(500)
      .json({ error: "Failed to regenerate OTP. Please try again later." });
  }
};

export const deleteUserById = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    // Check if the user exists in Firestore
    const userDocRef = db.collection("users").doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found in Firestore" });
    }

    // Delete user from Firebase Authentication
    try {
      await auth.deleteUser(userId);
    } catch (authError: any) {
      if (authError.code === "auth/user-not-found") {
        console.warn(
          `User ${userId} not found in Authentication, proceeding with Firestore deletion`
        );
      } else {
        throw authError; // Re-throw if it's a different error
      }
    }

    // Delete user data from Firestore
    await userDocRef.delete();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting user:", error);

    // Handle specific error cases
    if (error.code === "auth/user-not-found") {
      return res
        .status(404)
        .json({ error: "User not found in Authentication" });
    }

    res.status(500).json({
      error: "Failed to delete user",
      details: error.message,
    });
  }
};
