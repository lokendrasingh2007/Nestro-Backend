import express from "express";
const router = express.Router();
import { create, get, deleteById, StatusUpdate, getById, update, StatusById, addImages, deleteImage } from "../controllers/product.controller.js";
import upload from "../middleware/multer.js";
import { protect, authorize } from "../middleware/auth.js";

router.get("/", get);
router.get("/:id", getById);
router.post("/create", upload.single("image"), protect, authorize("admin", "superadmin"), create);
router.patch("/status-update/:id", protect, authorize("admin", "superadmin"), StatusUpdate);
router.put("/update/:id", upload.single("image"), protect, authorize("admin", "superadmin"), update);
router.delete("/delete/:id", protect, authorize("admin", "superadmin"), deleteById);
router.patch("/status/:id", protect, authorize("admin", "superadmin"), StatusById);
router.post("/add-multiple-images/:id", protect, authorize("admin", "superadmin"), upload.array("images", 8), addImages);
router.delete("/delete-image/:id", protect, authorize("admin", "superadmin"), deleteImage);


export default router