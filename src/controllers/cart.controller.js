import CartModel from "../models/cart.model.js";
import { sendBadRequest, sendConflict, sendCreated, sendNotFound, sendServerError, sendSuccess } from "../utils/response.js";
import sendOtpMail from "../utils/sendOtpMail.js";

const synsCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const localCart = JSON.parse(req.body.localCart) || [];

        if (localCart.length === 0) {
            const userCart = await CartModel.findOne({ userId }).populate({
                path: "items.productId",
                select: "name _id salePrice originalPrice discouny thumbnail"
            });
            return res.status(200).json({
                message: "Fetched cart from server",
                success: true,
                cart: userCart ? userCart.items : [],
                imageBaseUrl: "http://localhost:5000/api/category"
            })
        }
        let userCart = await CartModel.findOne({ userId })
            .populate({
                path: "items.productId",
                select: "name _id salePrice originalPrice discount thumbnail"
            });

        // If no cart + create new
        if (!userCart) {
            userCart = new CartModel({
                userId,
                items: []
            });
        }

        // Merge Local cart into DB cart
        localCart.forEach((cartItem) => {
            const { id, qty } = cartItem;
            const existingItem = userCart.items.find((item) => {
                return item.productId._id == id;
            });
            if (existingItem) {
                existingItem.qty += qty;
            }
            else {
                userCart.items.push({
                    productId: id,
                    qty
                });
            }
        });
        await userCart.save();

        res.status(200).json({
            message: "Cart synced successfully",
            success: true,
            cart: userCart,

        })
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
};


const addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, qty } = req.body;

        let userCart = await CartModel.findOne({ userId });

        if (!userCart) {
            userCart = await CartModel.create({
                userId,
                items: [{ productId, qty: qty || 1 }]
            });
            return res.status(200).json({
                success: true,
                message: "Product added Successfully",
                cart: userCart
            });
        }

        const existingItem = userCart.items.find(
            (item) => item.productId.toString() === productId.toString()
        );
        if (existingItem) {
            existingItem.qty += qty || 1;
        } else {
            userCart.items.push({ productId, qty: qty || 1 });
        }

        await userCart.save();

        return res.status(200).json({
            success: true,
            message: "Product added Successfully",
            cart: userCart
        });

    } catch (error) {
        console.error(error, "error");
        sendServerError(res, "Internal Server Error");
    }
};

const removeFromCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.body;

        const userCart = await CartModel.findOne({ userId });

        if (!userCart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        userCart.items = userCart.items.filter(
            (item) => item.productId.toString() !== productId.toString()
        );

        await userCart.save();

        return res.status(200).json({
            success: true,
            message: "Product removed successfully",
            cart: userCart
        });

    } catch (error) {
        console.error(error, "error");
        sendServerError(res, "Internal Server Error");
    }
};
const quantityHandler = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, action } = req.body;

        const userCart = await CartModel.findOne({ userId });

        if (!userCart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const item = userCart.items.find(
            (item) => item.productId.toString() === productId.toString()
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        }

        if (action === "increment") {
            item.qty += 1;

        }

        if (action === "decrement") {
            item.qty -= 1;
        }

        if (item.qty <= 0) {
            userCart.items = userCart.items.filter(
                i => i.productId.toString() !== productId.toString()
            );
        }

        await userCart.save();

        return res.status(200).json(
            {
                success: true,
                message: "Quantity updated successfully",
                cart: userCart
            }
        )

    } catch (error) {
        console.error(error, "error");
        sendServerError(res, "Internal Server Error");
    }
};

export {
    synsCart,
    addToCart,
    removeFromCart,
    quantityHandler,

};