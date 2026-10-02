import { BrevoClient } from "@getbrevo/brevo";

/**
 * Brevo Transactional Email Service
 *
 * Required env vars:
 *   BREVO_API_KEY          — Brevo dashboard > SMTP & API > API Keys
 *   BREVO_SENDER_EMAIL     — Brevo mein verified sender email
 *   BREVO_SENDER_NAME      — Sender display name (e.g. "Nestro")
 *
 * API key kabhi log nahi hogi.
 */

let _client = null;

const getClient = () => {
    if (!_client) {
        const key = process.env.BREVO_API_KEY;
        if (!key) {
            console.error("[email.service] BREVO_API_KEY missing in environment");
            return null;
        }
        _client = new BrevoClient({ apiKey: key });
    }
    return _client;
};

const getSender = () => ({
    email: process.env.BREVO_SENDER_EMAIL,
    name:  process.env.BREVO_SENDER_NAME || "Nestro",
});

// ─── OTP HTML Template ────────────────────────────────────────────────────────
const buildOtpHtml = (otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nestro OTP</title>
  <style>
    body { margin:0; padding:0; background-color:#F8F5F1; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; }
    .container { max-width:520px; margin:40px auto; padding:32px 28px; background:#FFFFFF; border-radius:16px; border:1px solid #E8E0D5; box-shadow:0 8px 24px rgba(44,32,22,0.08); text-align:center; }
    .logo { font-size:22px; font-weight:500; letter-spacing:0.12em; text-transform:uppercase; color:#1E1E1E; margin-bottom:8px; }
    .logo span { color:#8B5E3C; }
    .divider { width:60px; height:2px; background:#C6A27E; margin:16px auto 24px; }
    .badge { background:#EAF3DE; color:#3B6D11; font-size:11px; padding:2px 12px; border-radius:20px; display:inline-block; margin-bottom:6px; }
    .greeting { font-size:16px; color:#1E1E1E; font-weight:500; margin-bottom:6px; }
    .sub { font-size:14px; color:#6B7280; margin-bottom:24px; }
    .otp-box { background:#F5EDE4; border-radius:12px; padding:16px 20px; display:inline-block; margin:8px 0 24px; letter-spacing:4px; font-size:40px; font-weight:600; color:#2C2016; font-family:'Courier New',monospace; border:1px solid #D6BFA7; min-width:200px; }
    .info { font-size:13px; color:#6B7280; line-height:1.6; margin-bottom:28px; }
    .footer { font-size:12px; color:#9CA3AF; border-top:1px solid #E8E0D5; padding-top:20px; margin-top:8px; }
    .footer a { color:#8B5E3C; text-decoration:none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Nestro<span>.</span></div>
    <div class="divider"></div>
    <div class="badge">🔒 Secure Verification</div>
    <h1 class="greeting">One‑Time Password</h1>
    <p class="sub">Use the code below to verify your account</p>
    <div class="otp-box">${otp}</div>
    <p class="info">
      This OTP is valid for <strong>3 minutes</strong>.<br />
      If you didn't request this, you can safely ignore this email.
    </p>
    <div class="footer">
      <p style="margin:0 0 4px;">Need help? <a href="mailto:support@nestro.in">support@nestro.in</a></p>
      <p style="margin:0;">&copy; ${new Date().getFullYear()} Nestro. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

// ─── Contact HTML Template ────────────────────────────────────────────────────
const buildContactHtml = ({ senderName, senderEmail, subject, message }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body { margin:0; padding:0; background:#F8F5F1; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
    .container { max-width:560px; margin:40px auto; background:#fff; border-radius:16px; border:1px solid #E8E0D5; overflow:hidden; }
    .header { background:#2C2016; padding:24px 28px; }
    .logo { font-size:20px; font-weight:500; letter-spacing:0.12em; text-transform:uppercase; color:#FAF7F4; }
    .logo span { color:#C6A27E; }
    .badge { display:inline-block; background:#C6A27E; color:#2C2016; font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; margin-top:8px; }
    .body { padding:28px; }
    .title { font-size:18px; font-weight:600; color:#1E1E1E; margin-bottom:4px; }
    .sub { font-size:13px; color:#6B7280; margin-bottom:20px; }
    .row { display:flex; gap:8px; margin-bottom:10px; }
    .label { font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:#8B5E3C; width:80px; flex-shrink:0; padding-top:2px; }
    .value { font-size:13px; color:#1E1E1E; font-weight:500; }
    .msg-box { background:#F8F5F1; border:1px solid #E8E0D5; border-radius:10px; padding:16px; margin-top:16px; font-size:13px; color:#444; line-height:1.7; white-space:pre-wrap; }
    .footer { background:#F8F5F1; border-top:1px solid #E8E0D5; padding:16px 28px; font-size:11px; color:#9CA3AF; text-align:center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Nestro<span>.</span></div>
      <div class="badge">📬 New Contact Message</div>
    </div>
    <div class="body">
      <div class="title">New message received</div>
      <div class="sub">Someone submitted the contact form on your website.</div>
      <div class="row"><div class="label">Name</div><div class="value">${senderName}</div></div>
      <div class="row"><div class="label">Email</div><div class="value"><a href="mailto:${senderEmail}" style="color:#8B5E3C;">${senderEmail}</a></div></div>
      <div class="row"><div class="label">Subject</div><div class="value">${subject}</div></div>
      <div class="msg-box">${message}</div>
    </div>
    <div class="footer">Nestro Furniture · ${new Date().toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}</div>
  </div>
</body>
</html>`;

// ─── sendOtpEmail ─────────────────────────────────────────────────────────────
/**
 * OTP email bhejo via Brevo
 * @param {string} toEmail
 * @param {number} otp
 * @returns {Promise<boolean>}
 */
export const sendOtpEmail = async (toEmail, otp) => {
    const client = getClient();
    if (!client) return false;

    try {
        await client.transactionalEmails.sendTransacEmail({
            sender:      getSender(),
            to:          [{ email: toEmail }],
            subject:     "OTP Verification — Nestro",
            htmlContent: buildOtpHtml(otp),
        });

        console.log("[email.service] OTP sent to:", toEmail);
        return true;
    } catch (err) {
        const status  = err?.status || err?.response?.status || "unknown";
        const errBody = err?.body   || err?.response?.body   || err?.message || "unknown";
        console.error("[email.service] sendOtpEmail failed | status:", status, "| detail:", JSON.stringify(errBody));
        return false;
    }
};

// ─── sendContactEmail ─────────────────────────────────────────────────────────
/**
 * Contact form email bhejo via Brevo
 * @param {{ toEmail, senderName, senderEmail, subject, message }} params
 * @returns {Promise<boolean>}
 */
export const sendContactEmail = async ({ toEmail, senderName, senderEmail, subject, message }) => {
    const client = getClient();
    if (!client) return false;

    try {
        await client.transactionalEmails.sendTransacEmail({
            sender:      getSender(),
            to:          [{ email: toEmail }],
            replyTo:     { email: senderEmail, name: senderName },
            subject:     `[Contact] ${subject} — ${senderName}`,
            htmlContent: buildContactHtml({ senderName, senderEmail, subject, message }),
        });

        console.log("[email.service] Contact mail sent to:", toEmail);
        return true;
    } catch (err) {
        const status  = err?.status || err?.response?.status || "unknown";
        const errBody = err?.body   || err?.response?.body   || err?.message || "unknown";
        console.error("[email.service] sendContactEmail failed | status:", status, "| detail:", JSON.stringify(errBody));
        return false;
    }
};
