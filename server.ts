import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import vendorRoutes from "./routes/vendorsRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import productRoutes from "./routes/productRoutes";
import businessRoutes from "./routes/businessRoutes";
import withdrawalRoutes from "./routes/withdrawalRoutes";
import referralRoutes from "./routes/referralRoutes";
import purchaseRoutes from "./routes/purchaseRoutes";
import { errorHandler } from "./utils/errorHandler";
import affiliateRoutes from "./routes/affiliateRoutes";
import transactionsRoutes from "./routes/transactionsRoutes";
import earningsRoutes from "./routes/earningsRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import cloudinaryRoutes from "./routes/cloudRoute";

dotenv.config();

// Validate environment variables
const requiredEnvVars = [
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_DATABASE_URL",
  "EMAIL_USER",
  "EMAIL_PASS",
  "JWT_SECRET",
];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`Error: Environment variable ${varName} not set.`);
    process.exit(1);
  }
}

// Preventing the server from crashing
process.on("uncaughtException", (error: Error) => {
  console.log("Server is Shutting down due to uncaughtException", error);
  process.exit(1);
});

const app = express();
const port = process.env.PORT || 2200;

app.use(express.json());
app.use(cors());
app.use(errorHandler); // Error handling middleware
app.use("/uploads", express.static("uploads")); // Serve uploaded images

// Define the default GET route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API!",
    endpoints: {
      auth: "/auth",
      users: "/api/users",
      payments: "/api/payments",
      vendors: "/api/vendors",
      affiliates: "/api/affiliates",
      subscriptions: "/subscription",
      transactions: "/api/transactions",
      products: "/api/products",
      business: "/business",
      earnings: "/api/earnings",
      withdrawals: "/withdrawal",
      referrals: "/api/referrals",
      purchases: "/api/purchases",
    },
  });
});

// Register routes
app.use("/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/vendors", vendorRoutes); // Register vendor routes
app.use("/api/affiliates", affiliateRoutes); // Register affiliate routes
app.use("/subscription", subscriptionRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/product", productRoutes);
app.use("/business", businessRoutes);
app.use("/api/earnings", earningsRoutes);
app.use("/withdrawal", withdrawalRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/cloudinary", cloudinaryRoutes);

const server = app.listen(port, () => {
  console.clear();
  console.log(
    `Server is up and running \n Listening to Server on port: ${port}`
  );
});

process.on("unhandledRejection", (reason: any, promise: any) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Application specific logging, throwing an error, or other logic here
  server.close(() => {
    process.exit(1);
  });
});
