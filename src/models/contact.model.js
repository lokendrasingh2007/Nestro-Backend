import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName:  { type: String, default: "" },
    email:     { type: String, required: true },
    subject:   { type: String, default: "General Inquiry" },
    message:   { type: String, required: true },
    isRead:    { type: Boolean, default: false },
}, { timestamps: true });

const ContactModel = mongoose.model("Contact", contactSchema);
export default ContactModel;
