import ContactModel from "../models/contact.model.js";
import sendContactMail from "../utils/sendContactMail.js";
import { sendBadRequest, sendNotFound, sendServerError } from "../utils/response.js";

// POST /api/contact — save to DB + send email
const sendContact = async (req, res) => {
    try {
        const { firstName, lastName, email, subject, message } = req.body;

        if (!firstName || !email || !message) {
            return sendBadRequest(res, "First name, email, and message are required");
        }

        // Save to DB
        await ContactModel.create({ firstName, lastName, email, subject, message });

        // Send email to admin
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
        await sendContactMail({
            toEmail:     adminEmail,
            senderName:  `${firstName} ${lastName || ""}`.trim(),
            senderEmail: email,
            subject:     subject || "General Inquiry",
            message,
        });

        return res.status(200).json({ success: true, message: "Message sent successfully!" });
    } catch (error) {
        console.error(error);
        return sendServerError(res, "Internal Server Error");
    }
};

// GET /api/contact — admin: get all messages
const getContacts = async (req, res) => {
    try {
        const contacts = await ContactModel.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, contacts });
    } catch (error) {
        console.error(error);
        return sendServerError(res, "Internal Server Error");
    }
};

// PATCH /api/contact/:id/read — mark as read
const markRead = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await ContactModel.findByIdAndUpdate(id, { isRead: true }, { returnDocument: 'after' });
        if (!contact) return sendNotFound(res, "Message not found");
        return res.status(200).json({ success: true, contact });
    } catch (error) {
        console.error(error);
        return sendServerError(res, "Internal Server Error");
    }
};

// DELETE /api/contact/:id
const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await ContactModel.findByIdAndDelete(id);
        if (!contact) return sendNotFound(res, "Message not found");
        return res.status(200).json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        console.error(error);
        return sendServerError(res, "Internal Server Error");
    }
};

// POST /api/contact/:id/reply — admin reply to user
const replyContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { replyMessage } = req.body;

        if (!replyMessage?.trim()) {
            return sendBadRequest(res, "Reply message is required");
        }

        const contact = await ContactModel.findById(id);
        if (!contact) return sendNotFound(res, "Message not found");

        const transporter = (await import("nodemailer")).default.createTransport({
            service: "gmail",
            port: 587,
            secure: false,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        const html = `
<!DOCTYPE html>
<html>
<head><style>
  body{margin:0;padding:0;background:#F8F5F1;font-family:-apple-system,BlinkMacSystemFont,sans-serif;}
  .c{max-width:560px;margin:40px auto;background:#fff;border-radius:16px;border:1px solid #E8E0D5;overflow:hidden;}
  .h{background:#2C2016;padding:22px 28px;}
  .logo{font-size:20px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:#FAF7F4;}
  .logo span{color:#C6A27E;}
  .b{padding:28px;}
  .greeting{font-size:15px;font-weight:600;color:#1E1E1E;margin-bottom:6px;}
  .sub{font-size:13px;color:#6B7280;margin-bottom:20px;}
  .reply-box{background:#F8F5F1;border:1px solid #E8E0D5;border-radius:10px;padding:16px;font-size:13px;color:#444;line-height:1.7;white-space:pre-wrap;}
  .orig{margin-top:20px;padding-top:16px;border-top:1px solid #E8E0D5;}
  .orig-label{font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#8B5E3C;margin-bottom:8px;}
  .orig-box{background:#FFF8F5;border:1px solid #F0E8E0;border-radius:8px;padding:12px;font-size:12px;color:#6B7280;line-height:1.6;}
  .footer{background:#F8F5F1;border-top:1px solid #E8E0D5;padding:14px 28px;font-size:11px;color:#9CA3AF;text-align:center;}
</style></head>
<body>
<div class="c">
  <div class="h"><div class="logo">Nestro<span>.</span></div></div>
  <div class="b">
    <div class="greeting">Hi ${contact.firstName},</div>
    <div class="sub">Thank you for reaching out. Here's our response to your message:</div>
    <div class="reply-box">${replyMessage}</div>
    <div class="orig">
      <div class="orig-label">Your original message</div>
      <div class="orig-box">${contact.message}</div>
    </div>
  </div>
  <div class="footer">Nestro Furniture · support@nestro.in · ${new Date().getFullYear()}</div>
</div>
</body>
</html>`;

        await transporter.sendMail({
            from:    `"Nestro Support" <${process.env.EMAIL_USER}>`,
            to:      contact.email,
            subject: `Re: ${contact.subject}`,
            html,
        });

        // Mark as read after replying
        contact.isRead = true;
        await contact.save();

        return res.status(200).json({ success: true, message: "Reply sent successfully!" });
    } catch (error) {
        console.error(error);
        return sendServerError(res, "Failed to send reply");
    }
};

export { sendContact, getContacts, markRead, deleteContact, replyContact };
