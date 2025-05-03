import Settlement from "../model/restaurantSettlement.js";
import { bankTransfer } from "../utils/bankTransfer.js";
import { createNotification } from "../utils/notificationHelper.js";

export const addOrderToSettlement = async (req, res) => {
  try {
    const {
      restaurantId,
      restaurantName,
      orderId,
      subtotal,
      platformFee,
      weekEnding,
    } = req.body;

    // Find or create settlement record for this week
    let settlement = await Settlement.findOneAndUpdate(
      {
        restaurantId,
        weekEnding,
        status: "PENDING",
      },
      {
        $set: { restaurantName },
        $inc: {
          totalOrders: 1,
          orderSubtotal: subtotal,
          platformFee: platformFee,
          amountDue: subtotal - platformFee,
        },
        $push: {
          orderIds: orderId,
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json(settlement);
  } catch (error) {
    console.error("Settlement update error:", error);
    res.status(500).json({ error: "Failed to update settlement" });
  }
};

export const getAllSettlements = async (req, res) => {
  try {
    const settlements = await Settlement.find({})
      .sort({ weekEnding: -1 }) // Newest first
      .lean();

    res.status(200).json({
      success: true,
      settlements,
    });
  } catch (error) {
    console.error("Error fetching settlements:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch settlements",
    });
  }
};

// controllers/settlementController.js
export const processWeeklySettlements = async (req, res) => {
  try {
    // 1. Get pending settlements
    const lastSunday = getPreviousSunday();
    const pendingSettlements = await Settlement.find({
      weekEnding: lastSunday,
      status: "PENDING",
    });

    // 2. Process each settlement
    const results = await Promise.allSettled(
      pendingSettlements.map(async (settlement) => {
        try {
          const paymentResult = await bankTransfer(
            settlement.restaurantId,
            settlement.amountDue,
            `Weekly settlement ${
              settlement.weekEnding.toISOString().split("T")[0]
            }`
          );

          // Update settlement status
          const updatedSettlement = await Settlement.findByIdAndUpdate(
            settlement._id,
            {
              status: "PAID",
              paymentDate: new Date(),
              transactionId: paymentResult.reference,
            },
            { new: true }
          );

          // Create payment notification for restaurant
          await createNotification({
            type: "SETTLEMENT_PROCESSED",
            recipientType: "restaurant",
            recipientId: settlement.restaurantId,
            relatedEntity: {
              id: settlement._id.toString(),
              type: "settlement",
            },
            title: "Weekly Settlement Processed",
            message: `Your weekly settlement of $${settlement.amountDue.toFixed(
              2
            )} has been processed. Transaction ID: ${paymentResult.reference}`,
            metadata: {
              amount: settlement.amountDue,
              transactionId: paymentResult.reference,
              weekEnding: settlement.weekEnding,
            },
            status: "unread",
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          });

          return updatedSettlement;
        } catch (error) {
          await Settlement.findByIdAndUpdate(settlement._id, {
            status: "FAILED",
            failureReason: error.message,
          });

          // Create failure notification for restaurant
          await createNotification({
            type: "SETTLEMENT_FAILED",
            recipientType: "restaurant",
            recipientId: settlement.restaurantId,
            relatedEntity: {
              id: settlement._id.toString(),
              type: "settlement",
            },
            title: "Settlement Processing Failed",
            message: `Failed to process your weekly settlement of $${settlement.amountDue.toFixed(
              2
            )}. Reason: ${error.message}`,
            metadata: {
              amount: settlement.amountDue,
              weekEnding: settlement.weekEnding,
              error: error.message,
            },
            status: "unread",
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          });

          throw error;
        }
      })
    );

    // 3. Generate report
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    res.status(200).json({
      success: true,
      processed: pendingSettlements.length,
      successful,
      failed,
      settlements: results.map((r) =>
        r.status === "fulfilled" ? r.value : null
      ),
    });
  } catch (error) {
    console.error("Weekly settlement processing failed:", error);
    res.status(500).json({
      success: false,
      error: "Batch processing failed",
      details: error.message,
    });
  }
};
// Helpers
function getPreviousSunday() {
  const date = new Date();
  date.setDate(date.getDate() - ((date.getDay() + 7) % 7)); // Previous Sunday
  return date;
}
