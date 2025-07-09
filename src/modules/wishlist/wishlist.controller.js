import { userModel } from "../../../DataBase/models/user.model.js";
import { catchError } from "../../utiles/catchError.js";
import jwt from 'jsonwebtoken';

const extractUserIdFromToken = (req) => {
    try {
        const token = req.headers.token;
        if (!token) {
            return null;
        }
        const decoded = jwt.verify(token, 'ahmedrafat123');
        return decoded.userId;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
};

export const addToWishlist = catchError(async (req, res) => {
    try {
        const userId = extractUserIdFromToken(req);
        if (!userId) {
            return res.status(401).json({ msg: "Unauthorized: Invalid or missing token" });
        }

        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ msg: "Product ID is required" });
        }

        let result = await userModel.findByIdAndUpdate(
            userId, 
            { $addToSet: { wishlist: productId } }, 
            { new: true }
        ).populate('wishlist');

        if (result) {
            res.status(200).json({ 
                msg: "Product added to wishlist successfully", 
                result: result.wishlist 
            });
        } else {
            res.status(404).json({ msg: "User not found" });
        }
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }
});

export const removeFromWishlist = catchError(async (req, res) => {
    try {
        const userId = extractUserIdFromToken(req);
        if (!userId) {
            return res.status(401).json({ msg: "Unauthorized: Invalid or missing token" });
        }

        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ msg: "Product ID is required" });
        }

        let result = await userModel.findByIdAndUpdate(
            userId, 
            { $pull: { wishlist: productId } }, 
            { new: true }
        ).populate('wishlist');

        if (result) {
            res.status(200).json({ 
                msg: "Product removed from wishlist successfully", 
                result: result.wishlist 
            });
        } else {
            res.status(404).json({ msg: "User not found" });
        }
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }
});

export const clearWishlist = catchError(async (req, res) => {
    try {
        const userId = extractUserIdFromToken(req);
        if (!userId) {
            return res.status(401).json({ msg: "Unauthorized: Invalid or missing token" });
        }

        let result = await userModel.findByIdAndUpdate(
            userId, 
            { $set: { wishlist: [] } }, 
            { new: true }
        );

        if (result) {
            res.status(200).json({ 
                msg: "Wishlist cleared successfully", 
                result: [] 
            });
        } else {
            res.status(404).json({ msg: "User not found" });
        }
    } catch (error) {
        console.error('Clear wishlist error:', error);
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }
});

export const getAllWishlist = catchError(async (req, res) => {
    try {
        const userId = extractUserIdFromToken(req);
        if (!userId) {
            return res.status(401).json({ msg: "Unauthorized: Invalid or missing token" });
        }

        let result = await userModel.findOne({ _id: userId }).populate('wishlist');

        if (result) {
            res.status(200).json({ 
                msg: "Wishlist retrieved successfully", 
                result: result.wishlist || [] 
            });
        } else {
            res.status(404).json({ msg: "User not found" });
        }
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }
});