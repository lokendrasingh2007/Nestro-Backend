import UserModel from "../models/user.model.js";
import { sendBadRequest, sendConflict, sendCreated, sendNotFound, sendServerError, sendSuccess } from "../utils/response.js";
import sendOtpMail from "../utils/sendOtpMail.js";
import Cryptr from "cryptr";
const cryptr = new Cryptr(process.env.API_SECRET);
import generateToken from "../utils/generateToken.js";

const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;
        const user = await UserModel.findOne({ email });
        if (user) return sendConflict(res, "User already exists");
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiry = new Date(Date.now() + 3 * 60 * 1000);
        const mailResponse = await sendOtpMail(email, otp);
        console.log(mailResponse, "mailResponse");
        const hashedPassword = cryptr.encrypt(password,);
        await UserModel.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            otp,
            otpExpiry,
        });

        return res.status(201).json({
            user: { email },
            success: true,
            message: "User registered successfully. Please check your email for OTP verification",
        });
    } catch (error) {
        console.error(error, "error");
        sendServerError(res, "Internal Server Error");
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) return sendConflict(res, "User not found");
        if (user.otp != otp) {
            return sendBadRequest(res, "Invalid OTP");
        }
        if (Date.now() > user.otpExpiry) {
            return sendConflict(res, "OTP expired");
        }
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        return res.send({
            success: true,
            message: "OTP verified successfully!",
            email
        })
    } catch (error) {
        console.log(error, "error");
        sendServerError(res, "Internal Server Error");
    }
};

const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) return sendConflict(res, "User not found");
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiry = new Date(Date.now() + 3 * 60 * 1000);
        const mailResponse = await sendOtpMail(email, otp);
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();
        return sendSuccess(res, "OTP resent successfully. Please check your email");
    } catch (error) {
        console.log(error, "error");
        sendServerError(res, "Internal Server Error");
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) return sendConflict(res, "User not found");
        const decryptedPassword = cryptr.decrypt(user.password);

        if (decryptedPassword != password) return sendConflict(res, "Incorrect Password");
        if (!user.isVerified) return sendConflict(res, "Please verify your email before logging in");
        //Send Cookie
        const token = generateToken(user._id);
        res.cookie('jwt', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });
        // role cookie — middleware ke liye (httpOnly false taaki JS bhi read kar sake)
        res.cookie('role', user.role, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: false,
            secure: false,
            sameSite: 'lax'
        });
        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        console.log(error, "error")
        sendServerError(res, "Internal Server Error")
    }
}

const getProfile = async (req, res) => {
    try {
        const user = req.user;
        if (!user) return sendConflict(res, "User not found");

        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            user: user,
        }
        );
    } catch (error) {
        console.log(error, "error");
        sendServerError(res, "Internal Server Error");
    }
};
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });
        if (user != null) {
            // valid email
            const otp = Math.floor(100000 + Math.random() * 900000);
            const otpExpiry = new Date(Date.now() + 3 * 60 * 1000);
            const mailResponse = await sendOtpMail(email, otp);
            user.otp = otp;
            user.otpExpiry = otpExpiry;
            await user.save();
            return res.send({
                success: true,
                message: "OTP sent your email",
                email,
                otp,
            })
        } else {
            return sendConflict(res, "User with this email does not found");
        }
    } catch (error) {
        console.log(error, "error");
        sendServerError(res, "Internal Server Error");
    }
}
const updatePassword = async (req, res) => {
    try {
        const { email, old_password, new_password } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) return sendNotFound(res, "User with this email not found");
        const decPassword = cryptr.decrypt(user.password);
        if (old_password != null) {
            if (decPassword != old_password) {
                return sendConflict(res, "Old Password does not match");
            }
        }
        if (decPassword == new_password) {
            return sendConflict(res, "old nad new  Password cannot be same");
        }
        const encPassword = cryptr.encrypt(new_password);
        user.password = encPassword;
        await user.save();
        return res.send({
            success: true,
            message: "Password updated successfully",
        });


    } catch (error) {
        console.log(error, "error");
        sendServerError(res, "Internal Server Error");
    }
}

// Create admin/super_admin user (only super_admin can do this)
const createAdminUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, role } = req.body;
        if (!firstName || !lastName || !email || !password) return sendBadRequest(res, "All fields are required");
        if (!["admin", "superadmin"].includes(role)) return sendBadRequest(res, "Invalid role");

        const existing = await UserModel.findOne({ email });
        if (existing) return sendConflict(res, "User with this email already exists");

        const hashedPassword = cryptr.encrypt(password);
        const user = await UserModel.create({ firstName, lastName, email, password: hashedPassword, phone, role, isVerified: true });
        return res.status(201).json({ success: true, message: "Admin user created successfully", user });
    } catch (error) {
        console.log(error, "error");
        sendServerError(res, "Internal Server Error");
    }
};

// Delete user by ID
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        if (!user) return sendNotFound(res, "User not found");
        await UserModel.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.log(error, "error");
        sendServerError(res, "Internal Server Error");
    }
};

// Get all normal users only
const getNormalUsers = async (req, res) => {
    try {
        const users = await UserModel.find({ role: "user" }).select("-password -otp -otpExpiry");
        return res.status(200).json({ success: true, message: "Users fetched", users });
    } catch (error) {
        console.log(error, "error");
        sendServerError(res, "Internal Server Error");
    }
};

// Get all admin/super_admin users only
const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find({ role: { $in: ["admin", "superadmin"] } }).select("-password -otp -otpExpiry");
        return res.status(200).json({ success: true, message: "Users fetched", users });
    } catch (error) {
        console.log(error, "error");
        sendServerError(res, "Internal Server Error");
    }
};

const logout = async (req, res) => {
    try {
        res.clearCookie('jwt', { httpOnly: true, secure: false, sameSite: 'lax' });
        res.clearCookie('role', { httpOnly: false, secure: false, sameSite: 'lax' });
        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.log(error, "error");
        sendServerError(res, "Internal Server Error");
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = req.user;
        const { firstName, lastName, phone, dateOfBirth, gender } = req.body;
        if (firstName) user.firstName = firstName.trim();
        if (lastName) user.lastName = lastName.trim();
        if (phone) user.mobile = phone.trim();
        if (dateOfBirth) user.dateOfBirth = dateOfBirth;
        if (gender) user.gender = gender;
        await user.save();
        return res.status(200).json({ success: true, message: "Profile updated successfully", user });
    } catch (error) {
        console.log(error, "error");
        sendServerError(res, "Internal Server Error");
    }
};

const addAddress = async (req, res) => {
    try {
        const user = req.user;
        const { fullName, mobile, addressLine, city, state, country, pincode, isDefault } = req.body;
        if (!fullName || !mobile || !addressLine || !city || !state || !pincode)
            return sendBadRequest(res, "All required fields must be filled");
        if (isDefault) user.address.forEach(a => a.isDefault = false);
        const makeDefault = isDefault || user.address.length === 0;
        user.address.push({ fullName, mobile, addressLine, city, state, country: country || "India", pincode, isDefault: makeDefault });
        await user.save();
        return res.status(200).json({ success: true, message: "Address added successfully", address: user.address });
    } catch (error) {
        console.log(error, "error");
        sendServerError(res, "Internal Server Error");
    }
};

const getAddresses = async (req, res) => {
    try {
        const user = req.user;
        return res.status(200).json({
            success: true,
            message: "Addresses fetched successfully",
            address: user.address
        });
    } catch (error) {
        console.log(error, "error");
        sendServerError(res, "Internal Server Error");
    }
};

const updateAddress = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { fullName, mobile, addressLine, city, state, country, pincode, isDefault } = req.body;
        const addr = user.address.id(id);
        if (!addr) return sendNotFound(res, "Address not found");
        if (isDefault) user.address.forEach(a => a.isDefault = false);
        if (fullName) addr.fullName = fullName;
        if (mobile) addr.mobile = mobile;
        if (addressLine) addr.addressLine = addressLine;
        if (city) addr.city = city;
        if (state) addr.state = state;
        if (country) addr.country = country;
        if (pincode) addr.pincode = pincode;
        if (isDefault !== undefined) addr.isDefault = isDefault;
        await user.save();
        return res.status(200).json({ success: true, message: "Address updated successfully", address: user.address });
    } catch (error) {
        console.log(error, "error");
        sendServerError(res, "Internal Server Error");
    }
};

const deleteAddress = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const addr = user.address.id(id);
        if (!addr) return sendNotFound(res, "Address not found");
        addr.deleteOne();
        await user.save();
        return res.status(200).json({ success: true, message: "Address deleted successfully", address: user.address });
    } catch (error) {
        console.log(error, "error");
        sendServerError(res, "Internal Server Error");
    }
};

const setDefaultAddress = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const addr = user.address.id(id);
        if (!addr) return sendNotFound(res, "Address not found");
        user.address.forEach(a => a.isDefault = false);
        addr.isDefault = true;
        await user.save();
        return res.status(200).json({ success: true, message: "Default address updated", address: user.address });
    } catch (error) {
        console.log(error, "error");
        sendServerError(res, "Internal Server Error");
    }
};

// Update admin/super_admin user by ID
const updateAdminUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, phone, role } = req.body;

        const user = await UserModel.findById(id);
        if (!user) return sendNotFound(res, "User not found");

        if (firstName) user.firstName = firstName.trim();
        if (lastName)  user.lastName  = lastName.trim();
        if (phone)     user.mobile    = phone.trim();
        if (role && ["admin", "super_admin"].includes(role)) user.role = role;

        await user.save();
        return res.status(200).json({ success: true, message: "User updated successfully", user });
    } catch (error) {
        console.log(error, "error");
        sendServerError(res, "Internal Server Error");
    }
};

export {
    register,
    verifyOtp,
    resendOtp,
    login,
    logout,
    getProfile,
    updateProfile,
    forgotPassword,
    updatePassword,
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    createAdminUser,
    getAllUsers,
    getNormalUsers,
    deleteUser,
    updateAdminUser,
};