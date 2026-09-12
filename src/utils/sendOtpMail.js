import nodemailer from "nodemailer";

const sendOtpMail = async (toEmail, otp) => {
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

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nestro OTP</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F8F5F1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .container { max-width: 520px; margin: 40px auto; padding: 32px 28px; background: #FFFFFF; border-radius: 16px; border: 1px solid #E8E0D5; box-shadow: 0 8px 24px rgba(44, 32, 22, 0.08); text-align: center; }
    .logo { font-size: 22px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: #1E1E1E; margin-bottom: 8px; }
    .logo span { color: #8B5E3C; }
    .divider { width: 60px; height: 2px; background: #C6A27E; margin: 16px auto 24px; }
    .greeting { font-size: 16px; color: #1E1E1E; font-weight: 500; margin-bottom: 6px; }
    .sub { font-size: 14px; color: #6B7280; margin-bottom: 24px; }
    .otp-box { background: #F5EDE4; border-radius: 12px; padding: 16px 20px; display: inline-block; margin: 8px 0 24px; letter-spacing: 4px; font-size: 40px; font-weight: 600; color: #2C2016; font-family: 'Courier New', monospace; border: 1px solid #D6BFA7; min-width: 200px; }
    .info { font-size: 13px; color: #6B7280; line-height: 1.6; margin-bottom: 28px; }
    .footer { font-size: 12px; color: #9CA3AF; border-top: 1px solid #E8E0D5; padding-top: 20px; margin-top: 8px; }
    .footer a { color: #8B5E3C; text-decoration: none; }
    .badge { background: #EAF3DE; color: #3B6D11; font-size: 11px; padding: 2px 12px; border-radius: 20px; display: inline-block; margin-bottom: 6px; }
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
      <p style="margin: 0 0 4px;">Need help? <a href="mailto:support@nestro.in">support@nestro.in</a></p>
      <p style="margin: 0;">&copy; 2026 Nestro. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

        const mailOption = {
            from: `"Nestro Furniture" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: "OTP Verification — Nestro",
            html: htmlContent,
        };

        await transporter.sendMail(mailOption);
        return "OTP Email sent successfully";
    } catch (error) {
        console.error("sendOtpMail error:", error);
        return "Error sending Failed: " + error.message;
    }
};

export default sendOtpMail;
