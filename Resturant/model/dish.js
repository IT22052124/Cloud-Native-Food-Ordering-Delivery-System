import mongoose,{Types}from "mongoose";

const MediaSchema = mongoose.Schema({
  url: String,
  alt_text: String,
});

const dishSchema = mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  food_type: {
    type: String,
    enum: ["veg", "non-veg", "vegan"],
  },
  category: {
    type: String,
    enum: ["appetizer", "salad", "main_course", "dessert", "beverage"],
  },
  restaurantId: { type: Types.ObjectId, required: true },
  media: [MediaSchema],
});
export const Dish = mongoose.model("Dish", dishSchema);
