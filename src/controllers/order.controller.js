import OrderModel from "../models/order.model.js"; // fixed typo (was OrdertModel)
import { sendBadRequest, sendNotFound, sendServerError } from "../utils/response.js";
import CartModel from "../models/cart.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const place = async (req, res) => {
    try {
        const userId = req.user._id;
        const { shippingAddress, paymentMethod, localCart, extraShipping } = req.body;

        if (!shippingAddress || !paymentMethod) {
            return sendBadRequest(res, "Shipping address and payment method are required");
        }

        // Validate required address fields upfront
        const { fullName, addressLine, city, state, pinCode, country } = shippingAddress;
        if (!addressLine || !city || !state || !pinCode) {
            return sendBadRequest(res, "Incomplete shipping address. Please add addressLine, city, state, and pinCode.");
        }

        // ── Cart resolution ──────────────────────────────────────────────
        let cart = await CartModel.findOne({ userId }).populate({
            path: "items.productId",
            select: "name _id salePrice originalPrice thumbnail"
        });

        const hasValidDbItems = cart?.items?.some((item) => item?.productId);
        const shouldSyncLocalCart = Array.isArray(localCart) && localCart.length > 0 && (!cart || !cart.items.length || !hasValidDbItems);

        if (shouldSyncLocalCart) {
            if (!cart) cart = new CartModel({ userId, items: [] });
            cart.items = [];
            localCart.forEach(({ id, qty }) => {
                if (id) cart.items.push({ productId: id, qty: qty || 1 });
            });
            await cart.save();
            cart = await CartModel.findOne({ userId }).populate({
                path: "items.productId",
                select: "name _id salePrice originalPrice thumbnail"
            });
        }

        if (!cart || !cart.items.length) {
            return sendNotFound(res, "Cart not found");
        }

        const validItems = cart.items.filter((item) => item?.productId);

        if (!validItems.length) {
            return sendNotFound(res, "Cart items not found");
        }

        // ── Build order items with numeric prices ──────────────────────
        const items = validItems.map((item) => {
            const product = item.productId;
            // Ensure price is a number, fallback to 0
            const price = Number(product?.salePrice ?? product?.originalPrice ?? 0);
            return {
                product_id: product._id,
                qty: item.qty,
                price,
                total: price * item.qty,
            };
        });

        const itemsPrice = items.reduce((sum, i) => sum + i.total, 0);
        // Validate itemsPrice
        if (isNaN(itemsPrice) || itemsPrice < 0) {
            return sendBadRequest(res, "Invalid item prices");
        }

        const shippingPrice = (itemsPrice > 50000 ? 0 : 1000) + (Number(extraShipping) || 0);
        const totalAmount = itemsPrice + shippingPrice;

        // totalAmount must be > 0 and a valid number
        if (isNaN(totalAmount) || totalAmount <= 0) {
            return sendBadRequest(res, "Total order amount is invalid");
        }

        // ── Create order (pending) ─────────────────────────────────────
        const order = await OrderModel.create({
            user: userId,
            items,
            itemsPrice,
            shippingPrice,
            shippingAddress,
            totalAmount,
            paymentMethod,
            paymentStatus: "Pending",
        });

        // ── COD ──────────────────────────────────────────────────────────
        if (paymentMethod === "cod") {
            cart.items = [];
            await cart.save();
            return res.status(201).json({
                success: true,
                message: "Order placed successfully",
                orderId: order._id,
            });
        }

        // ── Online (Razorpay) ──────────────────────────────────────────
        let razorpayOrder;
        try {
            razorpayOrder = await razorpay.orders.create({
                amount: Math.round(totalAmount * 100), // paise, ensure integer
                currency: "INR",
                receipt: order._id.toString(),
            });
        } catch (razorpayError) {
            // Mark order as failed so it won't be left in "Pending" state
            await OrderModel.findByIdAndUpdate(order._id, {
                paymentStatus: "Failed",
            });
            // Provide a user-friendly message
            const message = razorpayError.message || "Payment gateway error. Please try again.";
            return sendBadRequest(res, message);
        }

        // Save Razorpay order ID and clear cart
        order.razorpay_order_id = razorpayOrder.id;
        await order.save();

        cart.items = [];
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Order created, proceed to payment",
            orderId: order._id,
            razorpay_order_id: razorpayOrder.id,
            amount: razorpayOrder.amount, // already in paise
            currency: razorpayOrder.currency,
        });

    } catch (error) {
        console.error(error);
        return sendServerError(res, "Internal Server Error");
    }
};

const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });
        }

        await OrderModel.findByIdAndUpdate(orderId, {
            paymentStatus: "Paid",
            razorpay_payment_id,
            razorpay_order_id,
            paidAt: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully"
        });
    } catch (error) {
        console.error(error);
        return sendServerError(res, "Internal Server Error");
    }
};

const getOrder = async (req, res) => {
    try {
        const orders = await OrderModel.find()
            .populate({ path: "items.product_id", select: "name thumbnail salePrice originalPrice" })
            .populate({ path: "user", model: "users", select: "firstName lastName email mobile" })
            .sort({ createdAt: -1 });
        return res.status(200).json({ message: "orders", success: true, orders });
    } catch (error) {
        console.error(error);
        return sendServerError(res, "Internal Server Error");
    }
};

const getMyOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const orders = await OrderModel.find({ user: userId })
            .populate({ path: "items.product_id", select: "name thumbnail salePrice originalPrice" })
            .populate({ path: "user", model: "users", select: "firstName lastName email mobile" })
            .sort({ createdAt: -1 });
        return res.status(200).json({ success: true, message: "Orders fetched", orders });
    } catch (error) {
        console.error(error);
        return sendServerError(res, "Internal Server Error");
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;

        const validStatuses = ["placed", "confirmed", "shipped", "out_for_delivery", "delivered", "return"];
        if (!validStatuses.includes(orderStatus)) {
            return sendBadRequest(res, "Invalid order status");
        }

        const order = await OrderModel.findByIdAndUpdate(
            id,
            { orderStatus },
            { returnDocument: 'after' }
        );

        if (!order) return sendNotFound(res, "Order not found");

        return res.status(200).json({ success: true, message: "Order status updated", order });
    } catch (error) {
        console.error(error);
        return sendServerError(res, "Internal Server Error");
    }
};

export { place, verifyPayment, getOrder, getMyOrders, updateOrderStatus };