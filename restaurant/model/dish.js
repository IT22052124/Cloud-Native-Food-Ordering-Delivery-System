import mongoose, { Types } from "mongoose";

const MediaSchema = mongoose.Schema({
  url: String,
  alt_text: String,
});

const dishSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    price: { type: Number, required: false },
    food_type: {
      type: String,
      enum: ["veg", "non-veg", "vegan"],
    },
    category: {
      type: String,
      enum: [
        "Appetizers",
        "Main Course",
        "Desserts",
        "Beverages",
        "Salads",
        "Soups",
        "Breads",
        "Rice Dishes",
        "Noodles",
        "Seafood",
        "Grilled",
        "Fast Food",
      ],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    restaurantId: { type: Types.ObjectId, required: true },
    imageUrls: [
      {
        type: String,
        trim: true,
       
      }
    ],
   portions: {
      type: [
        {
          size: {
            type: String,
            enum: ["small", "regular", "large"],
            required: true,
          },
          price: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
      required: false, // Optional for portion-based dishes
      default: null, // Ensure default is null for single-price dishes
      validate: {
        validator: function (array) {
          // If portions is null or undefined, validation passes (single-price dish)
          if (array === null || array === undefined) {
            return true;
          }
          // If portions is an array, ensure it has at least one entry
          return Array.isArray(array) && array.length > 0;
        },
        message: "At least one portion is required if portions are specified",
      },
    },
  },
  {
    timestamps: true,
  }
);


// Validator to ensure exactly one of price or portions is provided
dishSchema.pre("validate", function (next) {
  const hasPrice = this.price !== null && this.price !== undefined;
  const hasPortions = this.portions && Array.isArray(this.portions) && this.portions.length > 0;

  if (hasPrice && hasPortions) {
    next(new Error("A dish cannot have both a single price and portions"));
  } else if (!hasPrice && !hasPortions) {
    next(new Error("A dish must have either a single price or at least one portion"));
  } else {
    next();
  }
});

export const Dish = mongoose.model("Dish", dishSchema);
