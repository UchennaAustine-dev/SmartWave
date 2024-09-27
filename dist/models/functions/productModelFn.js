"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = void 0;
// Middleware to check user role
const checkRole = (role) => {
    return (req, res, next) => {
        if (req.user && (req.user.role === role || req.user.role === "admin")) {
            next(); // User has the correct role
        }
        else {
            res
                .status(403)
                .json({ error: "Access denied. Insufficient permissions." });
        }
    };
};
exports.checkRole = checkRole;
