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
exports.deleteUserById = exports.regenerateOtpController = exports.loginUser = exports.sendVerification = exports.verifyEmail = exports.registerVendorUser = exports.registerAffiliateUser = void 0;
// import { UserData } from "../utils/interface";
const userModel_1 = require("../models/userModel");
const dotenv_1 = __importDefault(require("dotenv"));
const errorUtils_1 = require("../utils/errorUtils");
const HTTPCODES_1 = require("../utils/HTTPCODES");
const emailUtils_1 = require("../utils/emailUtils");
const userModelFn_1 = require("../models/functions/userModelFn");
const admin_1 = require("../config/admin");
dotenv_1.default.config();
// Function to register an affiliate
const registerAffiliateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    try {
        const user = yield (0, userModel_1.registerAffiliate)(data); // Assuming registerAffiliate is defined elsewhere
        res
            .status(201)
            .json({ message: "Affiliate registered successfully", data: user });
    }
    catch (error) {
        console.error("Error registering affiliate:", error);
        res.status(error.httpcode || 500).json({ error: error.message });
    }
});
exports.registerAffiliateUser = registerAffiliateUser;
// Function to register a vendor
const registerVendorUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    try {
        const user = yield (0, userModel_1.registerVendor)(data); // Assuming registerVendor is defined elsewhere
        res
            .status(201)
            .json({ message: "Vendor registered successfully", data: user });
    }
    catch (error) {
        console.error("Error registering vendor:", error);
        res.status(error.httpcode || 500).json({ error: error.message });
    }
});
exports.registerVendorUser = registerVendorUser;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    try {
        const result = yield (0, userModel_1.verifyEmailToken)(email, otp);
        res.json({ message: "Email verified successfully", result });
    }
    catch (error) {
        console.error("Error verifying email:", error);
        res.status(error.httpcode || 500).json({ error: error.message });
    }
});
exports.verifyEmail = verifyEmail;
const sendVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        yield (0, userModelFn_1.sendVerificationEmail)(email);
        res.json({ message: "Verification email sent successfully" });
    }
    catch (error) {
        console.error("Error sending verification email:", error);
        res.status(error.httpcode || 500).json({ error: error.message });
    }
});
exports.sendVerification = sendVerification;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Authenticate the user
        const authResponse = yield (0, userModel_1.authenticateUser)(email, password);
        // Check if authResponse is defined
        if (!authResponse) {
            return res.status(401).json({ error: "Authentication failed" });
        }
        const { user, token } = authResponse;
        // Return the user and token
        res.json({ message: "Login successful", token });
    }
    catch (error) {
        console.error("Error logging in user:", error);
        // Handle specific error cases
        if (error instanceof errorUtils_1.MainAppError) {
            res.status(error.httpcode).json({ error: error.message });
        }
        else {
            res
                .status(HTTPCODES_1.HTTPCODES.INTERNAL_SERVER_ERROR)
                .json({ error: "An error occurred while logging in" });
        }
    }
});
exports.loginUser = loginUser;
// Regenerate OTP Controller
const regenerateOtpController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params; // Expecting userId request params
    const { email } = req.body; // Expecting userId and email in the request body
    if (!userId || !email) {
        return res.status(400).json({ error: "User ID and email are required." });
    }
    try {
        const newOtp = yield (0, emailUtils_1.regenerateOTP)(userId, email);
        res
            .status(200)
            .json({ message: "New OTP sent successfully.", otp: newOtp });
    }
    catch (error) {
        console.error("Error regenerating OTP:", error);
        res
            .status(500)
            .json({ error: "Failed to regenerate OTP. Please try again later." });
    }
});
exports.regenerateOtpController = regenerateOtpController;
const deleteUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        // Check if the user exists in Firestore
        const userDocRef = admin_1.db.collection("users").doc(userId);
        const userDoc = yield userDocRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found in Firestore" });
        }
        // Delete user from Firebase Authentication
        try {
            yield admin_1.auth.deleteUser(userId);
        }
        catch (authError) {
            if (authError.code === "auth/user-not-found") {
                console.warn(`User ${userId} not found in Authentication, proceeding with Firestore deletion`);
            }
            else {
                throw authError; // Re-throw if it's a different error
            }
        }
        // Delete user data from Firestore
        yield userDocRef.delete();
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (error) {
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
});
exports.deleteUserById = deleteUserById;
