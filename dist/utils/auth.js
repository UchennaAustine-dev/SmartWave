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
exports.generateAccessToken = exports.comparePasswords = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = yield bcryptjs_1.default.genSalt(10);
    return yield bcryptjs_1.default.hash(password, salt);
});
exports.hashPassword = hashPassword;
// Function to compare passwords
const comparePasswords = (plainPassword, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcryptjs_1.default.compare(plainPassword, hashedPassword);
});
exports.comparePasswords = comparePasswords;
// Function to generate an access token for the user
const generateAccessToken = (user) => {
    const payload = { userId: user.uid, email: user.email };
    const secretKey = process.env.JWT_SECRET; // Ensure this is set in your environment variables
    const options = { expiresIn: "1h" };
    return jsonwebtoken_1.default.sign(payload, secretKey, options);
};
exports.generateAccessToken = generateAccessToken;
