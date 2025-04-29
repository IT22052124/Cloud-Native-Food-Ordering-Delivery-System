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
    },
    // New fields for portion support
    portionId: {
      type: Schema.Types.ObjectId,
      sparse: true,
      default: null,
    },
    portionName: {
      type: String,
      default: null,
    },
    isPortionItem: {
      type: Boolean,
      required: true,
      default: false,
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

// Drop any existing indexes that might conflict
const oldIndexes = cartItemSchema.indexes();
oldIndexes.forEach((index) => {
  if (index[0].customerId && index[0].itemId) {
    cartItemSchema.index(index[0], { ...index[1], unique: false });
  }
});

// Create proper compound index that works with portions
cartItemSchema.index(
  {
    customerId: 1,
    itemId: 1,
    portionId: 1,
  },
  {
    unique: true,
    // Handle null portionIds properly
    partialFilterExpression: {
      $or: [
        { portionId: { $exists: true, $ne: null } },
        { portionId: { $exists: false } },
      ],
    },
    name: "unique_cart_item_with_portion",
  }
);

// Add a separate index for non-portion items
cartItemSchema.index(
  {
    customerId: 1,
    itemId: 1,
    isPortionItem: 1,
  },
  {
    unique: true,
    partialFilterExpression: { isPortionItem: false },
    name: "unique_cart_item_without_portion",
  }
);

const CartItem = model("CartItem", cartItemSchema);

export default CartItem;
