import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import { auth, db } from "../config/firebase";
// import {
//   createUserWithEmailAndPassword,
//   getIdToken,
//   sendEmailVerification,
// } from "firebase/auth";
// import { doc, setDoc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
// import { generateOTP, sendOTPEmail, validateOTP } from "../utils/utils";
// import { HTTPCODES } from "../utils/HTTPCODES";
// import { MainAppError } from "../utils/MainAppError";

// Function to hash passwords
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Function to compare passwords
 export const comparePasswords = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Function to generate an access token for the user
export const generateAccessToken = (user: any): string => {
  const payload = { userId: user.uid, email: user.email };
  const secretKey = process.env.JWT_SECRET!; // Ensure this is set in your environment variables
  const options = { expiresIn: "1h" };

  return jwt.sign(payload, secretKey, options);
};
