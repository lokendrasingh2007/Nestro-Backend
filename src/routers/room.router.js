import express from "express";
import { get, create, update, deleteById, StatusUpdate, getById } from "../controllers/room.controller.js";
import { protect, authorize } from "../middleware/auth.js"; 
const router = express.Router();

router.get("/", get);
router.post("/create", protect, authorize("admin", "superadmin"), create);
router.patch("/status-update/:id", protect, authorize("admin", "superadmin"), StatusUpdate);
router.put("/update/:id", protect, authorize("admin", "superadmin"), update);
router.delete("/delete/:id", protect, authorize("admin", "superadmin"), deleteById);
router.get("/:id", protect, getById);

export default router
