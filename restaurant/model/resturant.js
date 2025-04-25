import mongoose, { Types, Schema } from "mongoose";

const RestaurantSchema = new mongoose.Schema(
  {
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
    openingHours: {
      open: String,
      close: String,
      isClosed: Boolean,
    },

    isActive: { type: Boolean, default: true },

    restaurantAdmin: [
      {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
      },
    ],
    imageUrls: [
      {
        type: String,
        trim: true,
       
      }
    ],

    dishes: [Types.ObjectId],
    coverImageUrl: {
      type: String,
    },
    bank:{
      accountNumber: { type: String, required: false },
      accountHolderName: { type: String, required: false },
      bankName: { type: String, required: false },
      branch:{ type: String, required: false },
    },
    serviceType:{
      delivery: { type: Boolean, default: true },
      pickup: { type: Boolean, default: true },
      dineIn: { type: Boolean, default: true },
    },


    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" },
    },

    cuisineType: {
      type: String,
      enum: ["Indian", "Chinese", "Italian", "Mexican", "Continental"],
      default: "Indian",
    },

    isVerified: { type: String,
      enum: ["active", "suspended", "pending", ],
      default: "pending",
    required: false },

    reviews: [
      {
        userId: { type: Types.ObjectId, required: true },
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
      },
    ], 
    estimatedPrepTime: {
      type: Number, // In minutes
      default: 20,
    },

  },

  {
    timestamps: true,
  }
);

export const Restaurant = mongoose.model("Restaurant", RestaurantSchema);
