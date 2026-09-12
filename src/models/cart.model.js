import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    items: {
        type: [
            {
                _id: false,
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                qty: {
                    type: Number,
                    required: true
                }
            }
        ],
        required: true
    },
    status: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true
    }
)

const CartModel = mongoose.model("cart", cartSchema);
export default CartModel