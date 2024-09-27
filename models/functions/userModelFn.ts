import { HTTPCODES } from "../../utils/HTTPCODES";
import nodemailer from "nodemailer";
import { MainAppError } from "../../utils/errorUtils";
import dotenv from "dotenv";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../../config/firebase";
dotenv.config();

export const handleAuthError = (error: any) => {
  if (error.code === "auth/email-already-in-use") {
    throw new MainAppError({
      message: "Email already in use",
      httpcode: HTTPCODES.BAD_REQUEST,
    });
  } else if (error.code === "auth/invalid-email") {
    throw new MainAppError({
      message: "Invalid email address",
      httpcode: HTTPCODES.BAD_REQUEST,
    });
  } else if (error.code === "auth/weak-password") {
    throw new MainAppError({
      message: "Password should be at least 6 characters",
      httpcode: HTTPCODES.BAD_REQUEST,
    });
  } else if (error.code === "auth/network-request-failed") {
    throw new MainAppError({
      message: "Network error: Please check your internet connection.",
      httpcode: HTTPCODES.INTERNAL_SERVER_ERROR,
    });
  } else {
    console.error("Error adding user:", error);
    throw new MainAppError({
      message: "An error occurred while adding the user",
      httpcode: HTTPCODES.INTERNAL_SERVER_ERROR,
    });
  }
};

export const sendVerificationConfirmationEmail = async (email: string) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error("Email configuration is not set in environment variables.");
  }

  const transporter = nodemailer.createTransport({
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
    await transporter.sendMail(mailOptions);
    console.log(`Verification confirmation email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification confirmation email:", error);
    throw new Error(
      "Failed to send verification confirmation email. Please try again later."
    );
  }
};

export const sendVerificationEmail = async (email: string) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new MainAppError({
        message: "No user is currently signed in.",
        httpcode: HTTPCODES.UNAUTHORIZED,
      });
    }
    await sendEmailVerification(user);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new MainAppError({
      message: "Failed to send verification email",
      httpcode: HTTPCODES.INTERNAL_SERVER_ERROR,
    });
  }
};

// Helper Functions
export const generateReferralCode = (userId: string) => {
  return `REF-${userId.substring(0, 8).toUpperCase()}`;
};
