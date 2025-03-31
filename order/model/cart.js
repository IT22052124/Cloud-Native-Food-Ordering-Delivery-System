const { Schema, Types, model } = require("mongoose");

const CartItemSchema = new Schema(
  {
    itemId: {
      type: Types.ObjectId,
      required: true,
    },
    restaurantId: {
      type: Types.ObjectId,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const CartSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

const Cart = model("Cart", CartSchema);
export default Cart;
