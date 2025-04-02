import mongoose,{Types} from "mongoose";

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },

  ownerId: { type: Types.ObjectId, required: true },
  description: { type: String },

  address: {
    street: String,
    city: String,
    province: String,
    postalCode: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  contact: {
    phone: String,
    email: String,
  },
  openingHours: [
    {
      day: {
        type: String,
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      },
      open: String,
      close: String,
      isClosed: Boolean,
    },
  ],
  isActive: { type: Boolean, default: true },

  restaurantAdmin: {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


export const  Restaurant = mongoose.model("Restaurant", RestaurantSchema);
