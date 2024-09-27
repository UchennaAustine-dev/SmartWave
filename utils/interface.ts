import { User } from "firebase/auth";
import { FirebaseOptions } from "firebase/app";

// Define the UserData interface for type safety
export interface UserData {
  fullName: string;
  email: string;
  password: string;
  role: string;
  referralCode?: string;
}

export const requiredEnvVars = [
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_DATABASE_URL",
];
export interface AuthResponse {
  user: User;
  token: string;
}
// Define the type for the Firebase configuration
export interface FirebaseConfig extends FirebaseOptions {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

export interface FlutterwaveVerificationResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: string;
    payment_type: string;
    created_at: string;
    account_id: number;
    customer: {
      id: number;
      name: string;
      phone_number: string | null;
      email: string;
      created_at: string;
    };
  };
}

export interface Product {
  productName: string;
  productUrl: string;
  category: string;
  description: string;
  productPrice: number;
  commission: number;
  imageUrls: string[];
  vendorId: string;
  approvalStatus: "pending" | "approved" | "rejected";
}
