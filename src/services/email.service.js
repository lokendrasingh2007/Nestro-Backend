import { Resend } from "resend";

/**
 * Lazy Resend client — app.js mein dotenv/config load hone ke baad
 * pehli call par initialize hoga. API key kabhi log nahi hogi.
 */
let _resend = null;
const getResend = () => {
    if (!_resend) {
        const key = process.env.RESEND_API_KEY;
        if (!key) {
            console.error("[email.service] RESEND_API_KEY missing in environment");
            return null;
        }
        _resend = new Resend(key);
    }
    return _resend;
};

/**
 * Resend free plan mein sirf verified domain ya onboarding@resend.dev
 * se bhej sakte hain.
 * - Gmail address (@gmail.com) Resend se directly nahi bhej sakta.
 * - Agar apna domain verify karo (Resend dashboard → Domains) tab
 *   RESEND_FROM_EMAIL=noreply@yourdomain.com set karo.
 * - Tab tak onboarding@resend.dev use hoga (deliver hoga kisi bhi email par).
 */
const getFromEmail = () => {
    const from = process.env.RESEND_FROM_EMAIL?.trim();
    if (!from || from.endsWith("@gmail.com")) {
        return "Nestro <onboarding@resend.dev>";
    }
    return `Nestro <${from}>`;
};

/**
 * OTP verification email bhejo
 * @param {string} toEmail - recipient email
 * @param {number} otp     - 6-digit OTP
 * @returns {Promise<boolean>}
 */
export const sendOtpEmail = async (toEmail, otp) => {
    const resend = getResend();
    if (!resend) return false;

    try {
        const html = `
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
    <h1 class="greeting">One-Time Password</h1>
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

        const { data, error } = await resend.emails.send({
            from:    getFromEmail(),
            to:      toEmail,
            subject: "OTP Verification — Nestro",
            html,
        });

        if (error) {
            console.error("[email.service] OTP send failed:", error.name, "-", error.message);
            return false;
        }

        console.log("[email.service] OTP sent successfully, id:", data?.id);
        return true;
    } catch (err) {
        console.error("[email.service] sendOtpEmail exception:", err.message);
        return false;
    }
};

/**
 * Contact form email bhejo
 * @param {object} params - { toEmail, senderName, senderEmail, subject, message }
 * @returns {Promise<boolean>}
 */
export const sendContactEmail = async ({ toEmail, senderName, senderEmail, subject, message }) => {
    const resend = getResend();
    if (!resend) return false;

    try {
        const html = `
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
    <div class="footer">Nestro Furniture · Contact Form Submission · ${new Date().toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}</div>
  </div>
</body>
</html>`;

        const { data, error } = await resend.emails.send({
            from:     getFromEmail(),
            to:       toEmail,
            reply_to: senderEmail,
            subject:  `[Contact] ${subject} — ${senderName}`,
            html,
        });

        if (error) {
            console.error("[email.service] Contact mail failed:", error.name, "-", error.message);
            return false;
        }

        console.log("[email.service] Contact mail sent, id:", data?.id);
        return true;
    } catch (err) {
        console.error("[email.service] sendContactEmail exception:", err.message);
        return false;
    }
};
