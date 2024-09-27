import { Request, Response } from "express";
import axios from "axios";
import { db } from "../config/firebase"; // Adjust the import path as necessary
import { doc, updateDoc } from "firebase/firestore";
import dotenv from "dotenv";
import { getUserById } from "../models/userModel";
import asyncHandler from "../config/asynchandler";
import { FlutterwaveVerificationResponse } from "../utils/interface";

dotenv.config();

export const initiateRegistrationPayment = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.params;
  const registrationFee = 25; // Fixed registration fee amount in Naira
  // 25000
  // Validate input
  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }

  // Fetch user details
  const user = await getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  // Create a payment request to Flutterwave
  const paymentData = {
    tx_ref: `reg_${userId}_${Date.now()}`, // Unique transaction reference
    amount: registrationFee,
    currency: "NGN",
    payment_options: "card,banktransfer",
    customer: {
      email: user.email,
      phonenumber: user.phoneNumber,
      name: user.name,
    },
    customizations: {
      title: "Registration Fee Payment",
      description: "Payment for user registration",
      logo: "https://yourwebsite.com/logo.png",
    },
    redirect_url: `${process.env.FRONTEND_URL}/payment-callback`,
  };

  try {
    const response: any = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { data } = response.data;
    res.status(200).json({ paymentLink: data.link });
  } catch (error: any) {
    console.error(
      "Error initiating payment:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to initiate payment. Please try again later.",
      details: error.response?.data || error.message,
    });
  }
};

export const handlePaymentCallback = async (req: Request, res: Response) => {
  const { status, tx_ref, transaction_id } = req.query;

  if (
    typeof status !== "string" ||
    typeof tx_ref !== "string" ||
    typeof transaction_id !== "string"
  ) {
    console.error("Invalid query parameters");
    return res.redirect(`${process.env.FRONTEND_URL}/payment-error`);
  }

  if (status === "successful") {
    try {
      // Verify the transaction
      const verificationResponse =
        await axios.get<FlutterwaveVerificationResponse>(
          `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
          {
            headers: {
              Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            },
          }
        );

      const { data } = verificationResponse.data;

      if (
        data.status === "successful" &&
        data.amount >= 25000 &&
        data.currency === "NGN"
      ) {
        // Extract userId from tx_ref
        const parts = tx_ref.split("_");
        if (parts.length < 2) {
          console.error("Invalid tx_ref format");
          return res.redirect(`${process.env.FRONTEND_URL}/payment-error`);
        }
        const userId = parts[1];

        // Update user's registration status in Firestore
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { registrationStatus: "paid" });

        return res.redirect(`${process.env.FRONTEND_URL}/registration-success`);
      } else {
        return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      return res.redirect(`${process.env.FRONTEND_URL}/payment-error`);
    }
  } else {
    return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
  }
};

// export const PayForBusinessRegistrationWithFlutterwave = asyncHandler(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { userID, businessID } = req.params;

//       const user = await UserModels.findById(userID);
//       if (!user) {
//         return next(
//           new MainAppError({
//             message: "User not found",
//             httpcode: HTTPCODES.UNAUTHORIZED,
//           })
//         );
//       }

//       const getBusiness = await BusinessRegistrationModels.findById(businessID);

//       const amount: number = 25000;

//       const GenerateTransactionReference = uuid();

//       // Processing the payment with Flutterwave:

//       const response = await fetch("https://api.flutterwave.com/v3/payments", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${EnvironmentVariables.SECRET_KEY}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           tx_ref: GenerateTransactionReference,
//           amount: `${amount}`,
//           currency: "NGN",
//           redirect_url: "https://firstcapital.vercel.app/",
//           meta: {
//             consumer_id: user?._id,
//           },
//           customer: {
//             email: user?.email,
//             phonenumber: user?.phoneNumber,
//             name: user?.name,
//           },
//           customizations: {
//             title: "First Capital",
//             logo: "https://firstcapital.vercel.app/assets/logo1-b9ccfcb5.png",
//           },
//         }),
//       });

//       if (response.ok) {
//         const responseBody = await response.json();

//         // Check if payment was successful
//         if (responseBody.status === "success") {
//           // Update the business registration status
//           const UpdateBizStatus =
//             await BusinessRegistrationModels.findByIdAndUpdate(
//               getBusiness?._id,
//               {
//                 status: "Paid",
//               },
//               { new: true }
//             );

//           const BusinessTransactions = await TransactionModels.create({
//             message: `Dear ${user?.name}, you have paid for ${getBusiness?.ProposedBusinessName1} business registration`,
//             amount: amount,
//             TransactionReference: GenerateTransactionReference,
//             TransactionType: "Debit",
//             TransactionStatus: "Business Registration",
//           });

//           user?.transactions.push(
//             new mongoose.Types.ObjectId(BusinessTransactions._id)
//           );

//           user?.save();

//           return res.status(HTTPCODES.CREATED).json({
//             message: "Payment for business registration successful",
//             datafromPayment: responseBody,
//             BusinessRegistrationAmount: amount,
//             BusinessRegistrationStatus: UpdateBizStatus?.status,
//           });
//         } else {
//           console.log("Payment was not successful:", responseBody);
//           return res.status(HTTPCODES.BAD_REQUEST).json({
//             message: "Payment failed. Business registration not updated.",
//             datafromPayment: responseBody,
//           });
//         }
//       } else {
//         console.log(
//           `Request was not successful. Status code: ${response.status}`
//         );
//         return res.status(HTTPCODES.INTERNAL_SERVER_ERROR).json({
//           message: "Payment request was not successful.",
//         });
//       }
//     } catch (error: any) {
//       if (error.name === "CastError") {
//         return res.status(HTTPCODES.NOT_FOUND).json({
//           message: "User not found. Sign up",
//         });
//       }
//       return res.status(HTTPCODES.INTERNAL_SERVER_ERROR).json({
//         message: "An Error Occurred In Business registration Payment",
//         error: error?.message,
//       });
//     }
//   }
// );
