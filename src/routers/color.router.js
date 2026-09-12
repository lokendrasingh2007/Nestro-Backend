import express from "express";
const router = express.Router();
import { get, getById, create, update, deleteById, statusUpdate } from "../controllers/color.controller.js";
import { protect, authorize } from "../middleware/auth.js";

router.get("/", get);
router.get("/:id", getById);
router.post("/create", protect, authorize("admin", "superadmin"), create);
router.put("/update/:id", protect, authorize("admin", "superadmin"), update);
router.delete("/delete/:id", protect, authorize("admin", "superadmin"), deleteById);
router.patch("/status-update/:id", protect, authorize("admin", "superadmin"), statusUpdate);

export default router;
