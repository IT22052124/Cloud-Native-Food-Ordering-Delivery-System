import { Restaurant } from "../model/resturant.js";
import { Dish } from "../model/dish.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const restaurantAdminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const restaurant = await Restaurant.findOne({
      "restaurantAdmin.username": username,
    });
    if (!restaurant)
      return res.status(401).json({ message: "Restaurant not found!" });

    const isMatch = await bcrypt.compare(
      password,
      restaurant.restaurantAdmin.password
    );
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials!" });

    const token = jwt.sign({ id: restaurant._id }, process.env.JWT_SECRETS, {
      expiresIn: "1d",
    });

    res.json({
      token,
      restaurantId: restaurant._id,
      message: "Restaurant login successful!",
    });
  } catch (error) {
    console.log("Error in restaurant admin login", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const createDish = async (req, res) => {
  try {
    const { name, description, price, amount, food_type, category } = req.body;

    const restaurantId = req.resturantId;
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }
    const dish = {
      name,
      description,
      price,
      amount,
      food_type,
      category,
      restaurantId,
    };
    const newDish = await Dish.create(dish);
    if (!newDish) {
      return res.status(400).json({ message: "Failed to create dish" });
    }
    return res
      .status(201)
      .json({ message: "Dish created successfully", dish: newDish });
  } catch {
    console.log("Error in creating dish", error);
    res.status(500).json({ message: "Server error", error });
  }
};
