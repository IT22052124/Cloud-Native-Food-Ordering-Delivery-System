import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a transporter with environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send an email notification
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text message
 * @param {string} html - HTML message (optional)
 * @returns {Promise} - Nodemailer response
 */

export const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || "no-reply@fooddelivery.com",
      to,
      subject,
      text,
      html: html || text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
