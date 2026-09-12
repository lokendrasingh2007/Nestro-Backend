import express from "express";
const router = express.Router();
import { synsCart, addToCart, removeFromCart, quantityHandler } from "../controllers/cart.controller.js";
import upload from "../middleware/multer.js";
import { protect, authorize } from "../middleware/auth.js";

router.post("/syns-cart", protect, synsCart);
router.post("/add-to-cart", protect, addToCart);
router.post("/remove-from-cart", protect, removeFromCart);
router.post("/qty", protect, quantityHandler);



export default router