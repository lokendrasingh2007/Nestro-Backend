    import express from "express";
const router = express.Router();
import {
    login, register, verifyOtp, resendOtp, getProfile,
    updateProfile, logout, forgotPassword, updatePassword,
    addAddress, getAddresses, updateAddress, deleteAddress,
    setDefaultAddress, createAdminUser, getAllUsers, getNormalUsers, deleteUser,
    updateAdminUser
} from "../controllers/user.controller.js";
import { protect, authorize } from "../middleware/auth.js";

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.patch("/update-password", updatePassword);

// Protected routes
router.get("/profile", protect, getProfile);
router.patch("/profile", protect, updateProfile);

// Address routes
router.post("/address", protect, addAddress);
router.get("/address", protect, getAddresses);
router.put("/address/:id", protect, updateAddress);
router.delete("/address/:id", protect, deleteAddress);
router.patch("/address/:id/default", protect, setDefaultAddress);

// Admin user management
router.post("/admin/create", protect, authorize("superadmin"), createAdminUser);
router.get("/admin/users", protect, authorize("superadmin", "admin"), getAllUsers);
router.patch("/admin/users/:id", protect, authorize("superadmin"), updateAdminUser);
router.get("/admin/customers", protect, authorize("superadmin", "admin"), getNormalUsers);
router.delete("/admin/customers/:id", protect, authorize("superadmin", "admin"), deleteUser);

export default router;
