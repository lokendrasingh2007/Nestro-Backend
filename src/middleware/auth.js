import UserModel from "../models/user.model.js";
import { sendServerError } from "../utils/response.js";
import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
    try {

        let token = null;
        if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token && req.headers.authorization) {
            token = req.headers.authorization

        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const decoded = jwt.verify(token, process.env.API_SECRET);
        const user = await UserModel.findById(decoded.id).select("-password -otp -otpExpiry -isVerified -createdAt -updatedAt -__v");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        req.user = user;
        next();

    } catch (error) {
        console.log(error, "error");
        sendServerError(res, "Internal Server Error")
    }
}
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden"
            });
        }
        next();
    };
};
