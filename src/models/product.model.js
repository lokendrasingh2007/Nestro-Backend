import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "rooms",
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    originalPrice: {
        type: Number,
        required: true
    },
    salePrice: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true,
        default: 0
    },

    shortDescription: {
        type: String
    },
    description: {
        type: String
    },
    material: {
        type: String
    },
    dimensions: {
        width: Number,
        height: Number,
        depth: Number
    },
    weight: {
        type: Number
    },
    featured: {
        type: Boolean,
        default: false
    },
    color: {
        type: String
    },
    bestSeller: {
        type: Boolean,
        default: false
    },
    newArrival: {
        type: Boolean,
        default: false
    },
    thumbnail: {
        type: String
    },
    images: [
        {
            type: String
        }
    ],
    seoTitle: String,
    seoDescription: String,
    stock: {
        type: Boolean,
        default: true
    },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;