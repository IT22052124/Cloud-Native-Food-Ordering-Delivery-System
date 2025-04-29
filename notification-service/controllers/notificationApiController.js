import {
  sendEmail,
} from "../services/emailService.js";
import {
  sendSMS,
} from "../services/smsService.js";

export const sendEmailNotification = async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || !text) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: to, subject, and text are required",
      });
    }

    const result = await sendEmail(to, subject, text, html);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in sendEmailNotification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email notification",
      error: error.message,
    });
  }
};

/**
 * @desc    Send SMS notification
 * @route   POST /api/notifications/sms
 * @access  Private
 */
export const sendSmsNotification = async (req, res) => {
  try {
    const { to, body } = req.body;

    if (!to || !body) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: to and body are required",
      });
    }

    const result = await sendSMS(to, body);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in sendSmsNotification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send SMS notification",
      error: error.message,
    });
  }
};

