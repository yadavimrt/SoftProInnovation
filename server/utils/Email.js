const nodemailer = require("nodemailer");

// Create reusable pooled SMTP transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,
  maxConnections: 3,
  maxMessages: 100,
});

// One-time asynchronous background verify on server load
transporter.verify((err) => {
  if (err) {
    console.error("⚠️ [SMTP ERROR] Transporter connection verification failed:", err.message);
  } else {
    console.log("✅ [SMTP READY] SoftPro Innovation email service ready for dispatch.");
  }
});

/**
 * Send an HTML email via nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} html - Formatted HTML email body
 */
const sendEmail = async (to, subject, html) => {
  if (!to) {
    console.warn("⚠️ [SMTP] No recipient email provided. Skipping email dispatch.");
    return { success: false, error: "Missing recipient" };
  }

  try {
    const info = await transporter.sendMail({
      from: `"SoftPro Innovation" <${process.env.SMTP_USER || "noreply@softproinnovation.com"}>`,
      to: to.trim(),
      subject: subject,
      html: html,
    });

    console.log(`✉️ [EMAIL SENT] To: ${to} | Subject: "${subject}" | MsgId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ [EMAIL ERROR] Failed to send to "${to}":`, err.message);
    return { success: false, error: err.message };
  }
};

module.exports = sendEmail;