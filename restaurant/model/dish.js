import mongoose, { Types } from "mongoose";

const MediaSchema = mongoose.Schema({
  url: String,
  alt_text: String,
});

const dishSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  price: {type:Number,
    required:true,
  },
  food_type: {
    type: String,
    enum: ["veg", "non-veg", "vegan"],
  },
  category: {
    type: String,
  },
  isAvalaible: {
    type: Boolean,
    default: true,
  },
  restaurantId: { type: Types.ObjectId, required: true },
  media: [MediaSchema],
});
export const Dish = mongoose.model("Dish", dishSchema);
