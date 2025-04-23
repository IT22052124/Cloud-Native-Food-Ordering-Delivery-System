import Stripe from "stripe";
import Payment from "../models/Payment.js";
import axios from "axios";

const stripe = new Stripe(
  "sk_test_51RGHn3Gf4vgtIBBsdu66zgdbyogGymcG6UlsS17Dfcs5nZnp3GJjHubyhxdNQsOAfGMeRbqTSMCRwgAMuSktb50b00bFVF1Q6v",
  {
    apiVersion: "2023-08-16",
  }
);

// Initiate Payment
const initiatePayment = async (req, res) => {
  try {
    const { orderId, amount, currency = "lkr" } = req.body;
    const userId = req.user.id; // Assuming user ID comes from auth middleware

    // 1. Verify order exists and is valid for payment
    const orderResponse = await axios.get(
      `${process.env.ORDER_SERVICE_URL}/api/orders/${orderId}`,
      {
        headers: { Authorization: req.headers.authorization },
      }
    );

    const order = orderResponse.data?.order;

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.paymentStatus !== "PENDING") {
      return res.status(400).json({
        error: `Order already ${order.paymentStatus.toLowerCase()}`,
      });
    }

    // 2. Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: { orderId, userId },
      automatic_payment_methods: { enabled: true },
    });

    // 3. Create payment record in database
    const payment = new Payment({
      orderId,
      userId,
      amount: amount,
      currency: currency.toUpperCase(),
      paymentMethod: "CARD",
      status: "PENDING",
      paymentProcessor: "STRIPE",
      paymentIntentId: paymentIntent.id,
      cardDetails: req.body.cardDetails || null, // Optional card details
    });

    await payment.save();

    // 4. Update order with payment reference
    await axios.patch(
      `${process.env.ORDER_SERVICE_URL}/api/orders/${orderId}/payment`,
      {
        paymentDetails: {
          transactionId: paymentIntent.id,
          paymentProcessor: "STRIPE",
        },
      },
      { headers: { Authorization: req.headers.authorization } }
    );

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
    });
  } catch (err) {
    console.error("Payment initiation error:", err);
    res.status(500).json({
      error: err.response?.data?.message || err.message || "Payment failed",
    });
  }
};

// Webhook handler
const handleWebhook = async (req, res) => {
  console.log("here");
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      "whsec_09fdf4e0f25152ad70f721f6217f6ae3ed197455c2eddb806d8214a6330abe9b"
    );
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle payment success
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const { orderId, userId } = paymentIntent.metadata;

      // 1. Update payment record
      const payment = await Payment.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        {
          status: "PAID",
          paidAt: new Date(),
          cardDetails: {
            brand: paymentIntent.payment_method_details?.card?.brand,
            last4: paymentIntent.payment_method_details?.card?.last4,
            country: paymentIntent.payment_method_details?.card?.country,
            funding: paymentIntent.payment_method_details?.card?.funding,
          },
          receiptUrl: paymentIntent.charges?.data[0]?.receipt_url,
        },
        { new: true }
      );

      if (!payment) {
        console.error("Payment record not found for:", paymentIntent.id);
        return res.status(404).json({ error: "Payment record not found" });
      }

      // 2. Update order status
      await axios.patch(
        `${process.env.ORDER_SERVICE_URL}/api/orders/${orderId}/payment/status`,
        {
          status: "PAID",
          paymentDetails: {
            transactionId: paymentIntent.id,
            paymentProcessor: "STRIPE",
            cardLastFour: paymentIntent.payment_method_details?.card?.last4,
            receiptUrl: paymentIntent.charges?.data[0]?.receipt_url,
          },
        },
        { headers: { Authorization: req.headers.authorization } }
      );

      console.log(`Successfully processed payment for order ${orderId}`);
    }

    // Handle payment failure
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;

      await Payment.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        {
          status: "FAILED",
          failedAt: new Date(),
          failureReason:
            paymentIntent.last_payment_error?.message || "Unknown error",
        }
      );

      console.log(`Payment failed for intent: ${paymentIntent.id}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Cash on Delivery endpoint
const createCodPayment = async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    const userId = req.user.id;

    // Verify order exists
    const orderResponse = await axios.get(
      `${process.env.ORDER_SERVICE_URL}/orders/${orderId}`,
      {
        headers: { Authorization: req.headers.authorization },
      }
    );

    const order = orderResponse.data;

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Create COD payment record
    const payment = new Payment({
      orderId,
      userId,
      amount,
      currency: "LKR",
      paymentMethod: "CASH_ON_DELIVERY",
      status: "PAID",
      paidAt: new Date(),
    });

    await payment.save();

    // Update order status
    await axios.patch(
      `${process.env.ORDER_SERVICE_URL}/orders/${orderId}/payment/status`,
      {
        paymentStatus: "PAID",
        paymentMethod: "CASH_ON_DELIVERY",
      },
      { headers: { Authorization: req.headers.authorization } }
    );

    res.json({
      success: true,
      paymentId: payment._id,
    });
  } catch (err) {
    console.error("COD payment error:", err);
    res.status(500).json({
      error: err.response?.data?.message || err.message || "COD payment failed",
    });
  }
};

export default {
  initiatePayment,
  handleWebhook,
  createCodPayment,
};
