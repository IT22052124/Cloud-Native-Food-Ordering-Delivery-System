// utils/phoneFormatter.js
export const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Handle Sri Lankan numbers (starting with 0)
  if (digits.startsWith("0") && digits.length === 10) {
    return `+94${digits.substring(1)}`; // Replace 0 with +94
  }

  // If already has country code but missing +
  if (digits.startsWith("94") && digits.length === 11) {
    return `+${digits}`;
  }

  // If already in E.164 format
  if (digits.startsWith("+94") && digits.length === 12) {
    return digits;
  }

  throw new Error(`Invalid Sri Lankan phone number: ${phone}`);
};
