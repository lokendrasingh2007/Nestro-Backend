import mongoose from "mongoose";

const colorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Color name is required"],
        unique: true,
        trim: true
    },
    hex: {
        type: String,
        required: [true, "Hex code is required"],
        trim: true
    },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const ColorModel = mongoose.model("color", colorSchema);
export default ColorModel;
