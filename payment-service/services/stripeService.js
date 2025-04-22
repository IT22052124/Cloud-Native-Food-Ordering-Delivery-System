import Stripe from "stripe";
const stripe = new Stripe("sk_test_51RGHn3Gf4vgtIBBsdu66zgdbyogGymcG6UlsS17Dfcs5nZnp3GJjHubyhxdNQsOAfGMeRbqTSMCRwgAMuSktb50b00bFVF1Q6v");

export const createStripePayment = async ({
  orderId,
  amount,
  customerEmail,
  customerName,
  metadata,
}) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "lkr",
          product_data: { name: `Order #${orderId}` },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    customer_email: customerEmail,
    metadata: { ...metadata, customerName },
    success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`,
  });

  return { paymentUrl: session.url };
};
