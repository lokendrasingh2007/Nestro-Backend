import express from "express";
const router = express.Router();
import { create, get, deleteById, StatusUpdate, getById, update } from "../controllers/category.controller.js";
import upload from "../middleware/multer.js";
import { protect, authorize } from "../middleware/auth.js"; 


router.get("/", get);
router.post("/create", upload.single("image"), protect, authorize("admin", "superadmin"), create);
router.patch("/status-update/:id", protect, authorize("admin", "superadmin"), StatusUpdate);
router.put("/update/:id", upload.single("image"),protect, authorize("admin", "superadmin"), update);
router.delete("/delete/:id",protect, authorize("admin", "superadmin"), deleteById);
router.get("/:id", getById);


export default router