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
        message: "Username and password are required",
      });
    }

    // Find restaurant containing an admin with this username
    const restaurant = await Restaurant.findOne({
      "restaurantAdmin.username": username,
    });

    if (!restaurant) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Get the specific admin from the array
    const admin = restaurant.restaurantAdmin.find(
      (a) => a.username === username
    );

    if (!admin || !admin.password) {
      console.error(`Admin or password missing for: ${username}`);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: restaurant._id,
        adminId: admin._id,
        role: "restaurantAdmin",
        username: admin.username,
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
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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

    const existingDish = await Dish.findOne({ name, restaurantId });
    if (existingDish) {
      return res.status(400).json({ message: "Dish already exists" });
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

    const rest = await Restaurant.findById(restaurantId);
    rest.dishes.push(newDish._id);
    await rest.save();

    return res
      .status(201)
      .json({ message: "Dish created successfully", dish: newDish });
  } catch {
    console.log("Error in creating dish", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// controller function to get all dishes of a restaurant

export const getAllDishes = async (req, res) => {
  try {
    const restaurantId = req.resturantId;
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const dishes = await Dish.find({ restaurantId });
    if (!dishes || dishes.length === 0) {
      return res.status(404).json({ message: "No dishes found" });
    }

    return res.status(200).json({ count: dishes.length, dishes });
  } catch (error) {
    console.log("error on get all dishes", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

//controller function to update dish by id
export const updateDishById = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, price, amount, food_type, category } = req.body;
    const restaurantId = req.resturantId;

    // Validate restaurant ID
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    // Find the dish by ID
    const dish = await Dish.findById(id);
    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    // Update the dish fields
    dish.name = name || dish.name;
    dish.description = description || dish.description;
    dish.price = price || dish.price;
    dish.amount = amount || dish.amount;
    dish.food_type = food_type || dish.food_type;
    dish.category = category || dish.category;

    // Save the updated dish
    const updatedDish = await dish.save();

    return res
      .status(200)
      .json({ message: "Dish updated successfully", dish: updatedDish });
  } catch (error) {
    console.log("Error in updateDishById:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// controller to deleteDishById

export const deleteDish = async (req, res) => {
  try {
    const id = req.params.id;
    const restaurantId = req.resturantId;

    // Validate restaurant ID
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    // Find the dish by ID
    const dish = await Dish.findById(id);
    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    // Check if the dish belongs to the restaurant
    if (dish.restaurantId.toString() !== restaurantId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this dish" });
    }

    // Delete the dish
    await Dish.findByIdAndDelete(id);

    // Remove the dish ID from the restaurant's dishes array
    const restaurant = await Restaurant.findById(restaurantId);
    if (restaurant) {
      restaurant.dishes = restaurant.dishes.filter(
        (dishId) => dishId.toString() !== id
      );
      await restaurant.save();
    }

    return res.status(200).json({ message: "Dish deleted successfully" });
  } catch (error) {
    console.log("Error in deleteDish:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// controller function to get dishById
export const getDishById = async (req, res) => {
  try {
    const dishId = req.params.id;

    const dish =  await Dish.findOne({_id:dishId});
    if(dish){
      return res.status(400).json({"dish not found"});
    }
   
    return res.status(200).json({ dish });
  } catch (error) {
    console.log("error in getDishbyId", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
 