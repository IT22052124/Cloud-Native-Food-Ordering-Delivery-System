import twilio from "twilio";
import dotenv from "dotenv";
import { formatPhoneNumber } from "../utils/phoneFormatter.js";

dotenv.config();

// Initialize Twilio client with environment variables
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send SMS notification
 * @param {string} to - Recipient phone number (E.164 format: +1234567890)
 * @param {string} body - SMS message body
 * @returns {Promise} - Twilio response
 */
export const sendSMS = async (to, body) => {
  try {
    const formattedTo = formatPhoneNumber(to);
    const message = await twilioClient.messages.create({
      body,
      to: formattedTo,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    console.log(`SMS sent with SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};
