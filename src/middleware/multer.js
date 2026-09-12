import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Auto-detect folder from route
        let folder = "products";
        if (req.originalUrl.includes("/category")) folder = "categories";
        else if (req.originalUrl.includes("/product")) folder = "products";
        else if (req.originalUrl.includes("/room")) folder = "rooms";

        return {
            folder,
            allowed_formats: ["jpg", "png", "jpeg", "webp"],
            transformation: [{ quality: "auto" }],
        };
    },
});

const upload = multer({ storage });
export default upload;
