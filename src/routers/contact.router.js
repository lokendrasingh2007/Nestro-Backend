import express from "express";
const router = express.Router();
import { sendContact, getContacts, markRead, deleteContact, replyContact } from "../controllers/contact.controller.js";
import { protect, authorize } from "../middleware/auth.js";

router.post("/",            sendContact);
router.get("/",             protect, authorize("admin", "superadmin"), getContacts);
router.patch("/:id/read",   protect, authorize("admin", "superadmin"), markRead);
router.post("/:id/reply",   protect, authorize("admin", "superadmin"), replyContact);
router.delete("/:id",       protect, authorize("admin", "superadmin"), deleteContact);

export default router;
