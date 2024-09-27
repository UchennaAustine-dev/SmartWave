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
exports.verifyOTP = exports.regenerateOTP = exports.sendOTP = void 0;
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const firestore_1 = require("firebase/firestore");
const firebase_1 = require("../config/firebase");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const OTP_LENGTH = 6;
const OTP_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
// Generate a secure OTP
const generateOTP = () => {
    return crypto_1.default
        .randomInt(0, 10 ** OTP_LENGTH)
        .toString()
        .padStart(OTP_LENGTH, "0");
};
// Send OTP via email
const sendOTPEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (!emailUser || !emailPass) {
        throw new Error("Email configuration is not set in environment variables.");
    }
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: { user: emailUser, pass: emailPass },
    });
    const mailOptions = {
        from: emailUser,
        to: email,
        subject: "Your OTP for Verification",
        text: `Your OTP is: ${otp}\n\nThis OTP will expire in 5 minutes. Please use it to complete your verification process.`,
    };
    try {
        yield transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
    }
    catch (error) {
        console.error("Error sending OTP email:", error);
        throw new Error("Failed to send OTP email. Please try again later.");
    }
});
// Store OTP in Firestore
const storeOTP = (userId, otp) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, firestore_1.setDoc)((0, firestore_1.doc)(firebase_1.db, "otps", userId), {
        otp,
        createdAt: new Date().getTime(),
    });
});
// Validate OTP
const validateOTP = (userId, inputOtp) => __awaiter(void 0, void 0, void 0, function* () {
    const otpDocRef = (0, firestore_1.doc)(firebase_1.db, "otps", userId);
    const otpDoc = yield (0, firestore_1.getDoc)(otpDocRef);
    if (otpDoc.exists()) {
        const { otp, createdAt } = otpDoc.data();
        const currentTime = new Date().getTime();
        if (otp === inputOtp && currentTime - createdAt < OTP_EXPIRATION_TIME) {
            yield (0, firestore_1.deleteDoc)(otpDocRef); // Delete the OTP after successful validation
            return true;
        }
    }
    return false;
});
// Main function to send OTP
const sendOTP = (userId, email) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = generateOTP();
    yield storeOTP(userId, otp);
    yield sendOTPEmail(email, otp);
});
exports.sendOTP = sendOTP;
// Regenerate OTP
const regenerateOTP = (userId, email) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exports.sendOTP)(userId, email);
});
exports.regenerateOTP = regenerateOTP;
// Verify OTP
const verifyOTP = (userId, inputOtp) => __awaiter(void 0, void 0, void 0, function* () {
    return yield validateOTP(userId, inputOtp);
});
exports.verifyOTP = verifyOTP;
