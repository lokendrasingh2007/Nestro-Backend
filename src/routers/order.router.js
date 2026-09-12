import express from "express";
const router = express.Router();
import { place, verifyPayment, getOrder, getMyOrders, updateOrderStatus } from "../controllers/order.controller.js";
import { protect } from "../middleware/auth.js";

router.get("/", protect, getOrder);
router.get("/my-orders", protect, getMyOrders);
router.post("/place", protect, place);
router.post("/verify", protect, verifyPayment);
router.patch("/:id/status", protect, updateOrderStatus);

export default router;
