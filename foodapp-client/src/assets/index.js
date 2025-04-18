// In a real app, you would import actual image assets
// For this demo, we'll use simple colored rectangles as placeholders

// Function to create placeholder image objects
const createPlaceholderImage = (color = "#FF6B6B") => {
  // Return an object that can be used as an image source
  return {
    uri: `https://via.placeholder.com/40/${color.replace("#", "")}/FFFFFF`,
  };
};

// Export placeholders for payment method icons
export const creditCard = createPlaceholderImage("1565C0");
export const paypal = createPlaceholderImage("0070BA");
export const gpay = createPlaceholderImage("4285F4");
export const applepay = createPlaceholderImage("000000");
export const cash = createPlaceholderImage("4CAF50");

// Named exports that match the imports in the PaymentScreen
export default {
  "credit-card.png": creditCard,
  "paypal.png": paypal,
  "gpay.png": gpay,
  "applepay.png": applepay,
  "cash.png": cash,
};
