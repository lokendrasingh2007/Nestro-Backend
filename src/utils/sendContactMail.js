import nodemailer from "nodemailer";

const sendContactMail = async ({ toEmail, senderName, senderEmail, subject, message }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

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
    <div class="footer">Nestro Furniture · Contact Form Submission · ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
  </div>
</body>
</html>`;

        await transporter.sendMail({
            from: `"Nestro Contact Form" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            replyTo: senderEmail,
            subject: `[Contact] ${subject} — ${senderName}`,
            html,
        });

        return true;
    } catch (error) {
        console.error("sendContactMail error:", error);
        return false;
    }
};

export default sendContactMail;
