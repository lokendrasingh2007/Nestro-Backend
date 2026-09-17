import "dotenv/config";
import { sendOtpEmail, sendContactEmail } from "../services/email.service.js";
console.log("✅ sendOtpEmail:", typeof sendOtpEmail);
console.log("✅ sendContactEmail:", typeof sendContactEmail);
console.log("✅ RESEND_API_KEY set:", !!process.env.RESEND_API_KEY);
console.log("✅ All imports OK");
process.exit(0);
