import Settlement from "../model/restaurantSettlement.js";

export const addOrderToSettlement = async (req, res) => {
  try {
    const { restaurantId, orderId, subtotal, platformFee, weekEnding } =
      req.body;

    // Find or create settlement record for this week
    let settlement = await Settlement.findOneAndUpdate(
      {
        restaurantId,
        weekEnding,
        status: "PENDING",
      },
      {
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
