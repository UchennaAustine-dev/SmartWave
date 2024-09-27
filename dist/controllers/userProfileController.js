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
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPinController = exports.changePinController = exports.sendVerificationOTP = exports.editProfile = void 0;
const userModel_1 = require("../models/userModel");
const otpService_1 = require("../utils/otpService");
const editProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const { photo, username, name, bio, dateOfBirth, phoneNumber } = req.body;
    try {
        const user = yield (0, userModel_1.getUserById)(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const updatedData = {};
        if (photo)
            updatedData.photo = photo;
        if (username)
            updatedData.username = username;
        if (name)
            updatedData.name = name;
        if (bio)
            updatedData.bio = bio;
        if (dateOfBirth)
            updatedData.dateOfBirth = dateOfBirth;
        if (phoneNumber)
            updatedData.phoneNumber = phoneNumber;
        yield (0, userModel_1.updateUserProfile)(userId, updatedData);
        res.status(200).json({ message: "Profile updated successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Error updating profile" });
    }
});
exports.editProfile = editProfile;
// Send OTP for Email Verification
const sendVerificationOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }
    try {
        const user = yield (0, userModel_1.getUserByEmail)(email);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        yield (0, otpService_1.sendOTP)(user.id, email);
        res.status(200).json({ message: "OTP sent to email" });
    }
    catch (error) {
        console.error("Error sending OTP:", error);
        res
            .status(500)
            .json({ error: "Failed to send OTP. Please try again later." });
    }
});
exports.sendVerificationOTP = sendVerificationOTP;
// Verify OTP
// export const verifyPhoneNumber = async (req: Request, res: Response) => {
//   const { phoneNumber, otp } = req.body;
//   if (!phoneNumber || !otp) {
//     return res.status(400).json({ error: "Phone number and OTP are required" });
//   }
//   const isValid = await verifyOTP(phoneNumber, otp);
//   if (isValid) {
//     // Update user status or phone number in Firestore
//     res.status(200).json({ message: "Phone number verified successfully" });
//   } else {
//     res.status(400).json({ error: "Invalid OTP" });
//   }
// };
// Change Transaction PIN
const changePinController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { currentPin, newPin, confirmNewPin } = req.body;
    if (!userId || !currentPin || !newPin || !confirmNewPin) {
        return res.status(400).json({ error: "All fields are required." });
    }
    if (newPin !== confirmNewPin) {
        return res.status(400).json({ error: "New PINs do not match." });
    }
    try {
        const user = yield (0, userModel_1.getUserById)(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        // Check if the current PIN matches
        if (user.transactionPin !== currentPin) {
            return res.status(400).json({ error: "Current PIN is incorrect." });
        }
        // Update the PIN
        yield (0, userModel_1.updateUserPin)(userId, newPin);
        res.status(200).json({ message: "PIN changed successfully." });
    }
    catch (error) {
        console.error("Error changing PIN:", error);
        res
            .status(500)
            .json({ error: "Failed to change PIN. Please try again later." });
    }
});
exports.changePinController = changePinController;
// Forgot Transaction PIN
const forgotPinController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, newPin, confirmNewPin } = req.body;
    if (!email || !newPin || !confirmNewPin) {
        return res.status(400).json({ error: "All fields are required." });
    }
    if (newPin !== confirmNewPin) {
        return res.status(400).json({ error: "New PINs do not match." });
    }
    try {
        const user = yield (0, userModel_1.getUserByEmail)(email);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        // Update the PIN
        yield (0, userModel_1.updateUserPin)(user.id, newPin);
        res.status(200).json({ message: "PIN reset successfully." });
    }
    catch (error) {
        console.error("Error resetting PIN:", error);
        res
            .status(500)
            .json({ error: "Failed to reset PIN. Please try again later." });
    }
});
exports.forgotPinController = forgotPinController;
