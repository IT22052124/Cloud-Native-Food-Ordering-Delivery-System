import Stripe from "stripe";

// Initialize Stripe with your secret key
const stripe = new Stripe(
  "sk_test_51RGHn3Gf4vgtIBBsdu66zgdbyogGymcG6UlsS17Dfcs5nZnp3GJjHubyhxdNQsOAfGMeRbqTSMCRwgAMuSktb50b00bFVF1Q6v",
  {
    apiVersion: "2023-08-16",
  }
);

import Payment from "../models/Payment.js";

// Initiate Payment
const initiatePayment = async (req, res) => {

  console.log("Here")
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(req.body.amount * 100),
      currency: "lkr",
      automatic_payment_methods: { enabled: true },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Webhook handler
const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ error: "Order not found" });
    }

    payment.status = "success";
    await payment.save();
  }

  res.json({ received: true });
};

export default { initiatePayment, handleWebhook };
