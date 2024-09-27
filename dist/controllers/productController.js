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
exports.deleteProductController = exports.getProductsByCategoryController = exports.getProductByIdController = exports.getProductsController = exports.updateProductApprovalController = exports.addProductController = void 0;
const productModel_1 = require("../models/productModel");
const userModel_1 = require("../models/userModel");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Add a Product
const addProductController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productName, productUrl, category, description, productPrice, commission, } = req.body;
    const userId = req.params.userId;
    // Validate required fields
    if (!productName ||
        !productUrl ||
        !category ||
        !description ||
        !productPrice ||
        !commission ||
        !userId) {
        return res.status(400).json({ error: "All fields are required." });
    }
    try {
        // Image URLs are now attached to req.body by the handleImageUpload middleware
        const imageUrls = req.body.imageUrls;
        if (!imageUrls || imageUrls.length === 0) {
            return res.status(400).json({ error: "At least one image is required." });
        }
        // Create product data object
        const productData = {
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
        const productId = yield (0, productModel_1.addProduct)(productData);
        // Optionally, update the user's products array if the admin approves the product
        // await updateUserProducts(userId, productId);
        res.status(201).json({ message: "Product added successfully.", productId });
    }
    catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({
            error: "Failed to add product. Please try again later.",
            errorMessage: error.message,
            errorStack: error,
        });
    }
});
exports.addProductController = addProductController;
// Update Product Approval
const updateProductApprovalController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, status } = req.body;
    const userId = req.params.userId; // Assuming userId is passed in the URL
    if (!productId || !status) {
        return res
            .status(400)
            .json({ error: "Product ID and status are required." });
    }
    try {
        // Check if the user is an admin
        const user = yield (0, userModel_1.getUserById)(userId);
        if ((user === null || user === void 0 ? void 0 : user.role) !== "admin") {
            return res
                .status(403)
                .json({ error: "Forbidden. Only admins can update product approval." });
        }
        yield (0, productModel_1.updateProductApproval)(productId, status);
        res
            .status(200)
            .json({ message: "Product approval status updated successfully." });
    }
    catch (error) {
        console.error("Error updating product approval status:", error);
        res.status(500).json({
            error: "Failed to update product approval status. Please try again later.",
        });
    }
});
exports.updateProductApprovalController = updateProductApprovalController;
// Get All Products
const getProductsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield (0, productModel_1.getAllProducts)();
        res.json(products);
    }
    catch (error) {
        console.error("Get products error:", error);
        res
            .status(500)
            .json({ error: "An error occurred while fetching products" });
    }
});
exports.getProductsController = getProductsController;
// Get Product by ID
const getProductByIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params; // Extract productId from request parameters
    try {
        const product = yield (0, productModel_1.getProductById)(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }
        res.status(200).json(product); // Return the product data
    }
    catch (error) {
        console.error("Error retrieving product:", error);
        res
            .status(500)
            .json({ error: "Failed to retrieve product. Please try again later." });
    }
});
exports.getProductByIdController = getProductByIdController;
// Get Products by Category
const getProductsByCategoryController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category } = req.params; // Extract category from request parameters
    try {
        const products = yield (0, productModel_1.getProductsByCategory)(category);
        res.status(200).json(products); // Return the list of products in the specified category
    }
    catch (error) {
        console.error("Error retrieving products by category:", error);
        res
            .status(500)
            .json({ error: "Failed to retrieve products. Please try again later." });
    }
});
exports.getProductsByCategoryController = getProductsByCategoryController;
const deleteProductController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    try {
        // Delete the product
        yield (0, productModel_1.deleteProduct)(productId);
        res.status(200).json({ message: "Product deleted successfully." });
    }
    catch (error) {
        console.error("Error deleting product:", error);
        res
            .status(500)
            .json({ error: "Failed to delete product. Please try again later." });
    }
});
exports.deleteProductController = deleteProductController;
