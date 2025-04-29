import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Validate environment variables
const smtpConfig = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // `false` for TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Bypass SSL cert validation (DEV ONLY)
  },
};

const transporter = nodemailer.createTransport(smtpConfig);

export const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: `"FoodDash" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      text,
      html: html || text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Email failed:", error.message);
    throw new Error(`Email failed: ${error.message}`);
  }
};
