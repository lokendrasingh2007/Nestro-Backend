// Thin wrapper — actual logic email.service.js mein hai
import { sendContactEmail } from "../services/email.service.js";

const sendContactMail = async (params) => {
    return await sendContactEmail(params);
};

export default sendContactMail;
