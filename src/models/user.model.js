import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        default: null
    },
    dateOfBirth: {
        type: Date,
        default: null
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        default: null
    },
    role: {
        type: String,
        enum: ["user", "admin", "superadmin"],
        default: "user"
    },
    address: {
        type: [
            {
                fullName: { type: String, required: true },
                mobile: { type: String, required: true },
                addressLine: { type: String, required: true },
                city: { type: String, required: true },
                state: { type: String, required: true },
                country: { type: String, default: "India" },
                pincode: { type: String, required: true },
                isDefault: { type: Boolean, default: false }
            }
        ],
        default: []
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: Number,
    },
    otpExpiry: Date,
    status: {
        type: Boolean,
        default: true
    },
},
    {
        timestamps: true
    }
)

const UserModel = mongoose.model("users", userSchema);
export default UserModel;
