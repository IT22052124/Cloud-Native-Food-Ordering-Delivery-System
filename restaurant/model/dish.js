import mongoose, { Types } from "mongoose";

const MediaSchema = mongoose.Schema({
  url: String,
  alt_text: String,
});

const dishSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    price: { type: Number, required: true },
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
  },
  {
    timestamps: true,
  }
);
export const Dish = mongoose.model("Dish", dishSchema);
