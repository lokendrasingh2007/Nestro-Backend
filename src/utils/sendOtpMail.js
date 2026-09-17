// Thin wrapper — actual logic email.service.js mein hai
import { sendOtpEmail } from "../services/email.service.js";

const sendOtpMail = async (toEmail, otp) => {
    const success = await sendOtpEmail(toEmail, otp);
    return success ? "OTP Email sent successfully" : "Error sending OTP email";
};

export default sendOtpMail;
