import { Schema, model } from "mongoose";

const cartItemSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    itemPrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

cartItemSchema.pre("save", function (next) {
  let totalPrice = this.itemPrice * this.quantity;
  this.totalPrice = totalPrice;
  next();
});

cartItemSchema.index({ customerId: 1, itemId: 1 }, { unique: true });
const CartItem = model("CartItem", cartItemSchema);

export default CartItem;
