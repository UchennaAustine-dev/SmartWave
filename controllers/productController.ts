import { Request, Response } from "express";
import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProductApproval,
  getProductsByCategory,
  deleteProduct,
} from "../models/productModel";
import { getUserById } from "../models/userModel";
import { uploadImages } from "../utils/fileUpload";
import { Product } from "../utils/interface";
import dotenv from "dotenv";

dotenv.config();
// Add a Product
export const addProductController = async (req: Request, res: Response) => {
  const {
    productName,
    productUrl,
    category,
    description,
    productPrice,
    commission,
  } = req.body;
  const userId = req.params.userId;

  // Validate required fields
  if (
    !productName ||
    !productUrl ||
    !category ||
    !description ||
    !productPrice ||
    !commission ||
    !userId
  ) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Image URLs are now attached to req.body by the handleImageUpload middleware
    const imageUrls = req.body.imageUrls;

    if (!imageUrls || imageUrls.length === 0) {
      return res.status(400).json({ error: "At least one image is required." });
    }

    // Create product data object
    const productData: Product = {
      productName,
      productUrl,
      category,
      description,
      productPrice: Number(productPrice),
      commission: Number(commission),
      imageUrls,
      vendorId: userId,
      approvalStatus: "pending",
    };

    console.log(productData);

    // Add product to the database
    const productId = await addProduct(productData);

    // Optionally, update the user's products array if the admin approves the product
    // await updateUserProducts(userId, productId);

    res.status(201).json({ message: "Product added successfully.", productId });
  } catch (error: any) {
    console.error("Error adding product:", error);
    res.status(500).json({
      error: "Failed to add product. Please try again later.",
      errorMessage: error.message,
      errorStack: error,
    });
  }
};

// Update Product Approval
export const updateProductApprovalController = async (
  req: Request,
  res: Response
) => {
  const { productId, status } = req.body;
  const userId = req.params.userId; // Assuming userId is passed in the URL

  if (!productId || !status) {
    return res
      .status(400)
      .json({ error: "Product ID and status are required." });
  }

  try {
    // Check if the user is an admin
    const user = await getUserById(userId);
    if (user?.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Forbidden. Only admins can update product approval." });
    }

    await updateProductApproval(productId, status);
    res
      .status(200)
      .json({ message: "Product approval status updated successfully." });
  } catch (error) {
    console.error("Error updating product approval status:", error);
    res.status(500).json({
      error:
        "Failed to update product approval status. Please try again later.",
    });
  }
};

// Get All Products
export const getProductsController = async (req: Request, res: Response) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching products" });
  }
};

// Get Product by ID
export const getProductByIdController = async (req: Request, res: Response) => {
  const { productId } = req.params; // Extract productId from request parameters

  try {
    const product = await getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    res.status(200).json(product); // Return the product data
  } catch (error) {
    console.error("Error retrieving product:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve product. Please try again later." });
  }
};

// Get Products by Category
export const getProductsByCategoryController = async (
  req: Request,
  res: Response
) => {
  const { category } = req.params; // Extract category from request parameters

  try {
    const products = await getProductsByCategory(category);
    res.status(200).json(products); // Return the list of products in the specified category
  } catch (error) {
    console.error("Error retrieving products by category:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve products. Please try again later." });
  }
};

export const deleteProductController = async (req: Request, res: Response) => {
  const { productId } = req.params;

  try {
    // Delete the product
    await deleteProduct(productId);

    res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Error deleting product:", error);
    res
      .status(500)
      .json({ error: "Failed to delete product. Please try again later." });
  }
};
