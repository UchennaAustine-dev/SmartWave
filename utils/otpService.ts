import crypto from "crypto";
import nodemailer from "nodemailer";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import dotenv from "dotenv";

dotenv.config();

const OTP_LENGTH = 6;
const OTP_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

interface OTPData {
  otp: string;
  createdAt: number;
}

interface UserData {
  id: string;
  email: string;
  transactionPin?: string;
  // Add other user properties as needed
}

// Generate a secure OTP
const generateOTP = (): string => {
  return crypto
    .randomInt(0, 10 ** OTP_LENGTH)
    .toString()
    .padStart(OTP_LENGTH, "0");
};

// Send OTP via email
const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error("Email configuration is not set in environment variables.");
  }

  const transporter = nodemailer.createTransport({
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
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email. Please try again later.");
  }
};

// Store OTP in Firestore
const storeOTP = async (userId: string, otp: string): Promise<void> => {
  await setDoc(doc(db, "otps", userId), {
    otp,
    createdAt: new Date().getTime(),
  });
};

// Validate OTP
const validateOTP = async (
  userId: string,
  inputOtp: string
): Promise<boolean> => {
  const otpDocRef = doc(db, "otps", userId);
  const otpDoc = await getDoc(otpDocRef);

  if (otpDoc.exists()) {
    const { otp, createdAt } = otpDoc.data() as OTPData;
    const currentTime = new Date().getTime();

    if (otp === inputOtp && currentTime - createdAt < OTP_EXPIRATION_TIME) {
      await deleteDoc(otpDocRef); // Delete the OTP after successful validation
      return true;
    }
  }
  return false;
};

// Main function to send OTP
export const sendOTP = async (userId: string, email: string): Promise<void> => {
  const otp = generateOTP();
  await storeOTP(userId, otp);
  await sendOTPEmail(email, otp);
};

// Regenerate OTP
export const regenerateOTP = async (
  userId: string,
  email: string
): Promise<void> => {
  await sendOTP(userId, email);
};

// Verify OTP
export const verifyOTP = async (
  userId: string,
  inputOtp: string
): Promise<boolean> => {
  return await validateOTP(userId, inputOtp);
};
