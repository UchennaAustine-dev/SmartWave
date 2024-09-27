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
exports.generateReferralCode = exports.sendVerificationEmail = exports.sendVerificationConfirmationEmail = exports.handleAuthError = void 0;
const HTTPCODES_1 = require("../../utils/HTTPCODES");
const nodemailer_1 = __importDefault(require("nodemailer"));
const errorUtils_1 = require("../../utils/errorUtils");
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("firebase/auth");
const firebase_1 = require("../../config/firebase");
dotenv_1.default.config();
const handleAuthError = (error) => {
    if (error.code === "auth/email-already-in-use") {
        throw new errorUtils_1.MainAppError({
            message: "Email already in use",
            httpcode: HTTPCODES_1.HTTPCODES.BAD_REQUEST,
        });
    }
    else if (error.code === "auth/invalid-email") {
        throw new errorUtils_1.MainAppError({
            message: "Invalid email address",
            httpcode: HTTPCODES_1.HTTPCODES.BAD_REQUEST,
        });
    }
    else if (error.code === "auth/weak-password") {
        throw new errorUtils_1.MainAppError({
            message: "Password should be at least 6 characters",
            httpcode: HTTPCODES_1.HTTPCODES.BAD_REQUEST,
        });
    }
    else if (error.code === "auth/network-request-failed") {
        throw new errorUtils_1.MainAppError({
            message: "Network error: Please check your internet connection.",
            httpcode: HTTPCODES_1.HTTPCODES.INTERNAL_SERVER_ERROR,
        });
    }
    else {
        console.error("Error adding user:", error);
        throw new errorUtils_1.MainAppError({
            message: "An error occurred while adding the user",
            httpcode: HTTPCODES_1.HTTPCODES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.handleAuthError = handleAuthError;
const sendVerificationConfirmationEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (!emailUser || !emailPass) {
        throw new Error("Email configuration is not set in environment variables.");
    }
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: emailUser,
            pass: emailPass,
        },
    });
    const mailOptions = {
        from: emailUser,
        to: email,
        subject: "Smartwave Account Verification Successful",
        text: `Your account has been successfully verified.`,
    };
    try {
        yield transporter.sendMail(mailOptions);
        console.log(`Verification confirmation email sent to ${email}`);
    }
    catch (error) {
        console.error("Error sending verification confirmation email:", error);
        throw new Error("Failed to send verification confirmation email. Please try again later.");
    }
});
exports.sendVerificationConfirmationEmail = sendVerificationConfirmationEmail;
const sendVerificationEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = firebase_1.auth.currentUser;
        if (!user) {
            throw new errorUtils_1.MainAppError({
                message: "No user is currently signed in.",
                httpcode: HTTPCODES_1.HTTPCODES.UNAUTHORIZED,
            });
        }
        yield (0, auth_1.sendEmailVerification)(user);
    }
    catch (error) {
        console.error("Error sending verification email:", error);
        throw new errorUtils_1.MainAppError({
            message: "Failed to send verification email",
            httpcode: HTTPCODES_1.HTTPCODES.INTERNAL_SERVER_ERROR,
        });
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
// Helper Functions
const generateReferralCode = (userId) => {
    return `REF-${userId.substring(0, 8).toUpperCase()}`;
};
exports.generateReferralCode = generateReferralCode;
