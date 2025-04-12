import { Restaurant } from "../model/resturant.js";
import { Dish } from "../model/dish.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const restaurantAdminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Username and password are required" 
      });
    }

    // Find restaurant containing an admin with this username
    const restaurant = await Restaurant.findOne({
      "restaurantAdmin.username": username
    });


    if (!restaurant) {
      return res.status(401).json({ 
        message: "Invalid credentials" 
      });
    }

    // Get the specific admin from the array
    const admin = restaurant.restaurantAdmin.find(a => a.username === username);
    
    if (!admin || !admin.password) {
      console.error(`Admin or password missing for: ${username}`);
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: "Invalid password" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: restaurant._id,
        adminId: admin._id,
        role: 'restaurantAdmin',
        username: admin.username
      }, 
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Return success response with full restaurant object
    return res.json({
      message: "Login successful",
      token,
      restaurant: {
        resturantId: restaurant._id,
        name: restaurant.name,
        ownerId: restaurant.ownerId,
        // Include other fields you need, but avoid sensitive data
      },
     
    });

  } catch (error) {
    console.error("Restaurant admin login error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
