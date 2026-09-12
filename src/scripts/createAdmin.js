import "dotenv/config";
import mongoose from "mongoose";
import Cryptr from "cryptr";

// ─── Config ───────────────────────────────────────────────────────────────────
const ADMIN_DATA = {
    firstName: "Super",
    lastName:  "Admin",
    email:     "lokendrasinghrajput2007@gmail.com",
    password:  "Admin@1234",
    role:      "superadmin",   // must match user.model.js enum
    isVerified: true,
};
// ──────────────────────────────────────────────────────────────────────────────

const cryptr = new Cryptr(process.env.API_SECRET);

// Inline schema (avoids circular imports)
const userSchema = new mongoose.Schema({
    firstName:  { type: String, required: true, trim: true },
    lastName:   { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, lowercase: true },
    password:   { type: String, required: true },
    mobile:     { type: String, default: null },
    role:       { type: String, enum: ["user", "admin", "superadmin"], default: "user" },
    address:    { type: Array, default: [] },
    isVerified: { type: Boolean, default: false },
    otp:        { type: Number },
    otpExpiry:  Date,
    status:     { type: Boolean, default: true },
}, { timestamps: true });

const UserModel = mongoose.models.users || mongoose.model("users", userSchema);

async function main() {
    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected!\n");

        // Check if admin already exists
        const existing = await UserModel.findOne({ email: ADMIN_DATA.email });
        if (existing) {
            console.log(`Admin already exists: ${existing.email}  (role: ${existing.role})`);
            console.log("Deleting old record and recreating...");
            await UserModel.findByIdAndDelete(existing._id);
        }

        const hashedPassword = cryptr.encrypt(ADMIN_DATA.password);

        const admin = await UserModel.create({
            firstName:  ADMIN_DATA.firstName,
            lastName:   ADMIN_DATA.lastName,
            email:      ADMIN_DATA.email,
            password:   hashedPassword,
            role:       ADMIN_DATA.role,
            isVerified: ADMIN_DATA.isVerified,
        });

        console.log("✅ Admin account created successfully!\n");
        console.log("─────────────────────────────────────");
        console.log(`  Email   : ${ADMIN_DATA.email}`);
        console.log(`  Password: ${ADMIN_DATA.password}`);
        console.log(`  Role    : ${admin.role}`);
        console.log(`  ID      : ${admin._id}`);
        console.log("─────────────────────────────────────\n");

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from DB.");
        process.exit(0);
    }
}

main();
