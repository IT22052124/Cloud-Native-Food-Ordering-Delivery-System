import { Restaurant } from "../model/resturant.js";
import { Dish } from "../model/dish.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";

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
        message: "User not found",
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
        message: "Invalid password",
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const isverfied = restaurant.isVerified;

    console.log("isverfied", isverfied);
    if (isverfied === "pending") {
      return res.status(401).json({
        message: "Restaurant is not verified yet",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: restaurant._id,
        adminId: admin._id,
        role: "restaurant",
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
    const {
      name,
      description,
      price,
      portions,
      food_type,
      category,
      imageUrls,
    } = req.body;

    const restaurantId = req.resturantId;
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const existingDish = await Dish.findOne({ name, restaurantId });
    if (existingDish) {
      return res.status(400).json({ message: "Dish already exists" });
    }

    // Validate price and portions
    const hasPrice = price !== null && price !== undefined;
    const hasPortions =
      portions && Array.isArray(portions) && portions.length > 0;
    if (hasPrice && hasPortions) {
      return res
        .status(400)
        .json({
          message: "A dish cannot have both a single price and portions",
        });
    }
    if (!hasPrice && !hasPortions) {
      return res
        .status(400)
        .json({
          message:
            "A dish must have either a single price or at least one portion",
        });
    }

    const dish = {
      name,
      description,
      price: hasPrice ? price : null,
      portions: hasPortions ? portions : null,
      food_type,
      category,
      restaurantId,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
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
  } catch (error) {
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
    const {
      name,
      description,
      price,
      portions,
      food_type,
      category,
      isAvailable,
      imageUrls: newImageUrls,
    } = req.body;

    const restaurantId = req.resturantId;

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const dish = await Dish.findById(id);
    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    // Validate price and portions
    const hasPrice = price !== null && price !== undefined;
    const hasPortions =
      portions && Array.isArray(portions) && portions.length > 0;
    if (hasPrice && hasPortions) {
      return res
        .status(400)
        .json({
          message: "A dish cannot have both a single price and portions",
        });
    }
    if (
      !hasPrice &&
      !hasPortions &&
      dish.price === null &&
      (!dish.portions || dish.portions.length === 0)
    ) {
      return res
        .status(400)
        .json({
          message:
            "A dish must have either a single price or at least one portion",
        });
    }

    // Handle image deletion
    if (Array.isArray(newImageUrls)) {
      const imagesToDelete = dish.imageUrls.filter(
        (url) => !newImageUrls.includes(url)
      );

      for (const oldImageUrl of imagesToDelete) {
        try {
          const imageRef = ref(storage, oldImageUrl);
          await deleteObject(imageRef);
        } catch (err) {
          console.error("Failed to delete old image:", err);
        }
      }

      dish.imageUrls = newImageUrls; // Update with new URLs
    }

    dish.name = name ?? dish.name;
    dish.description = description ?? dish.description;
    dish.price = hasPrice ? price : hasPortions ? null : dish.price;
    dish.portions = hasPortions ? portions : hasPrice ? null : dish.portions;
    dish.food_type = food_type ?? dish.food_type;
    dish.category = category ?? dish.category;

    // 🔥 This fixes the problem!
    if (typeof isAvailable !== "undefined") dish.isAvailable = isAvailable;

    const updatedDish = await dish.save();

    return res
      .status(200)
      .json({ message: "Dish updated successfully", dish: updatedDish });
  } catch (error) {
    console.error("Error in updateDishById:", error);
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

    for (const imageUrl of dish.imageUrls) {
      try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.error(`Failed to delete image ${imageUrl}:`, error);
      }
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

//controller function to get dishById
export const getDishById = async (req, res) => {
  try {
    const dishId = req.params.id;

    const dish = await Dish.findOne({ _id: dishId });
    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    return res.status(200).json({ dish });
  } catch (error) {
    console.log("error in getDishbyId", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// Existing getOrdersForRestaurant controller (from previous context)
export const getOrdersForRestaurant = async (req, res) => {
  try {
    const restaurantId = req.restaurantId;
    const { status, page = 1, limit = 10 } = req.query;
    const ordersServiceUrl = `${global.gConfig.orders_url}/api/orders/restaurant`;
    const params = { page, limit };
    if (status) {
      params.status = status;
    }

    const response = await axios.get(ordersServiceUrl, {
      params,
      headers: {
        Authorization: req.headers.authorization,
      },
    });

    res.status(200).json({
      status: 200,
      orders: response.data.orders,
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit,
    });
  } catch (error) {
    console.log("error in getOrdersForRestaurant", error);

    console.error("Error fetching orders from orders microservice:", error);
    if (error.response) {
      return res.status(error.response.status).json({
        status: error.response.status,
        message: error.response.data.message || "Failed to fetch orders",
      });
    }
    console.log("error in getOrdersForRestaurant", error);
    res.status(500).json({
      status: 500,
      message: "Failed to fetch orders from orders microservice",
    });
  }
};

// controller function to get all restaurants for a specific owner
export const updateRestaurant = async (req, res) => {
  try {
    // Check if req.body exists
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }
    const {
      name,
      description,
      address,
      contact,
      restaurantAdmin,
      imageUrls: newImageUrls,
      coverImageUrl,
      openingHours,
      bank,
      serviceType,
      cuisineType,
      estimatedPrepTime,
    } = req.body;

    const restaurant = await Restaurant.findById(req.params.id);

    // Check if the restaurant exists
    if (restaurantAdmin?.password) {
      const hashedPassword = await bcrypt.hash(restaurantAdmin.password, 10);
      restaurant.restaurantAdmin.password = hashedPassword;
    }

    if (Array.isArray(newImageUrls)) {
      const imagesToDelete = restaurant.imageUrls.filter(
        (url) => !newImageUrls.includes(url)
      );

      for (const oldImageUrl of imagesToDelete) {
        try {
          const imageRef = ref(storage, oldImageUrl);
          await deleteObject(imageRef);
        } catch (err) {
          console.error("Failed to delete old image:", err);
        }
      }

      restaurant.imageUrls = newImageUrls; // Update with new URLs
    }
    if (coverImageUrl && coverImageUrl !== restaurant.coverImageUrl) {
      if (restaurant.coverImageUrl) {
        try {
          const imageRef = ref(storage, restaurant.coverImageUrl);
          await deleteObject(imageRef);
        } catch (err) {
          console.error("Failed to delete old cover image:", err);
        }
      }
      restaurant.coverImageUrl = coverImageUrl;
    } else if (coverImageUrl === "") {
      if (restaurant.coverImageUrl) {
        try {
          const imageRef = ref(storage, restaurant.coverImageUrl);
          await deleteObject(imageRef);
        } catch (err) {
          console.error("Failed to delete old cover image:", err);
        }
      }
      restaurant.coverImageUrl = "";
    } else {
      restaurant.coverImageUrl = restaurant.coverImageUrl;
    }
    restaurant.name = name || restaurant.name;
    restaurant.description = description || restaurant.description;
    restaurant.address = address || restaurant.address;
    restaurant.contact = contact || restaurant.contact;
    restaurant.openingHours = Array.isArray(openingHours)
      ? openingHours
      : restaurant.openingHours; // Update only if provided
    restaurant.bank = bank || restaurant.bank;
    restaurant.serviceType = serviceType || restaurant.serviceType;
    restaurant.cuisineType = cuisineType || restaurant.cuisineType;
    restaurant.estimatedPrepTime =
      estimatedPrepTime || restaurant.estimatedPrepTime;
    restaurant.restaurantAdmin.username =
      restaurantAdmin?.username || restaurant.restaurantAdmin.username;

    restaurant.location = {
      type: "Point",
      coordinates: [
        address.coordinates.lng || restaurant.address.coordinates.lng,
        address.coordinates.lat || restaurant.address.coordinates.lat,
      ],
    };

    await restaurant.save();
    res.json({ message: "Restaurant updated successfully!", restaurant });
  } catch (error) {
    console.log("Error in updating restaurant", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// controller function to get all restaurants for a specific owner
export const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found!" });
    }
    res.json(restaurant);
  } catch (error) {
    console.log("Error in getting restaurant by ID", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// controller function to get all restaurants for a specific owner
export const updateRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Validate request body
    if (typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ message: "isActive must be a boolean value" });
    }

    // Find the restaurant
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found!" });
    }

    // // Check if the requester is the owner
    // if (restaurant.ownerId.toString() !== req.adminId) {
    //   return res.status(403).json({ message: "Access denied!" });
    // }

    // Update the status
    restaurant.isActive = isActive;
    await restaurant.save();

    res.json({
      message: "Restaurant status updated successfully!",
      restaurant,
    });
  } catch (error) {
    console.log("Error in updating restaurant status", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAdminCredentials = async (req, res) => {
  try {
    // Validate req.username and req.resturantId
    if (!req.username || !req.resturantId) {
      console.log("Missing username or restaurant ID:", {
        username: req.username,
        resturantId: req.resturantId,
      });
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    // Ensure the restaurant ID matches the user's restaurant
    if (req.params.id !== req.resturantId) {
      console.log("Restaurant ID mismatch:", {
        requestedId: req.params.id,
        userResturantId: req.resturantId,
      });
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Access to this restaurant is denied",
      });
    }

    const restaurant = await Restaurant.findById(req.params.id).select(
      "restaurantAdmin.username"
    );

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found!" });
    }

    // Get all usernames from restaurantAdmin
    const usernames = restaurant.restaurantAdmin.map((admin) => admin.username);

    return res.status(200).json({
      success: true,
      usernames: usernames,
    });
  } catch (error) {
    console.log("Error in getting admin credentials:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Update username and/or password for the logged-in restaurant admin
 * @route   PATCH /api/branch/credentials
 * @access  Private (Restaurant Admin)
 */
export const updateAdminCredentials = async (req, res) => {
  try {
    const { currentUsername, newUsername, newPassword } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found!" });
    }

    // Validate input
    if (!currentUsername) {
      return res.status(400).json({
        message: "Current username is required",
      });
    }

    if (!newUsername && !newPassword) {
      return res.status(400).json({
        message: "At least one of newUsername or newPassword must be provided",
      });
    }

    // Find the admin credential to update
    const adminIndex = restaurant.restaurantAdmin.findIndex(
      (admin) => admin.username === currentUsername
    );

    if (adminIndex === -1) {
      return res.status(404).json({
        message: "Username not found",
      });
    }

    // Check for duplicate username if newUsername is provided
    if (newUsername) {
      const existingUsername = await Restaurant.findOne({
        "restaurantAdmin.username": newUsername,
        _id: { $ne: restaurant._id }, // Exclude current restaurant
      });

      if (existingUsername) {
        return res.status(400).json({
          message: `Username '${newUsername}' already exists`,
        });
      }

      restaurant.restaurantAdmin[adminIndex].username = newUsername;
    }

    // Update password if provided
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      restaurant.restaurantAdmin[adminIndex].password = hashedPassword;
    }

    await restaurant.save();

    res.status(200).json({
      success: true,
      message: "Credentials updated successfully",
      updatedUsername: restaurant.restaurantAdmin[adminIndex].username,
    });
  } catch (error) {
    console.log("Error in updating admin credentials", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
