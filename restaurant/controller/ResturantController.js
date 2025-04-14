import { Restaurant } from "../model/resturant.js";
import { Dish } from "../model/dish.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

export const addRestaurant = async (req, res) => {
  try {
    const ownerId = req.owner; // From JWT
    const {
      name,
      description,
      street,
      city,
      province,
      postalCode,
      lat,
      lng,
      phone,
      email,
      username,
      password,
    } = req.body;

    // First check if username already exists in any restaurant
    const existingAdmin = await Restaurant.findOne({
      "restaurantAdmin.username": username,
    });

    const exist = await Restaurant.findOne({
      "address.street": street,
      "address.city": city,
    });
    if (exist) {
      return res.status(400).json({
        message: "Restaurant already exists in this location.",
      });
    }

    if (existingAdmin) {
      return res.status(400).json({
        message: "Username already exists. Please choose a different one.",
      });
    }

    // Hash restaurant admin password
    const hashedPassword = await bcrypt.hash(password, 10);

    const restaurant = {
      ownerId: ownerId, // Owner ID from JWT
      name,
      description,
      address: {
        street: street,
        city: city,
        province: province,
        postalCode: postalCode,
        coordinates: {
          lat: lat,
          lng: lng,
        },
      },
      contact: {
        phone: phone,
        email: email,
      },
      restaurantAdmin: {
        username: username,
        password: hashedPassword,
      },
    };

    const resturants = await Restaurant.create(restaurant);
    res
      .status(201)
      .json({ message: "Restaurant added successfully!", resturants });
  } catch (error) {
    console.log("Error in adding restaurant", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * @desc    Get all restaurants for an owner
 * @route   GET /api/restaurants/my-restaurants
 * @access  Private (Only authenticated owners)
 */
export const getMyRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ ownerId: req.owner });

    if (!restaurants || restaurants.length === 0) {
      return res.status(404).json({ message: "No restaurants found!" });
    }

    res.json({ count: restaurants.length, restaurants });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * @desc    Get a single restaurant by ID
 * @route   GET /api/restaurants/:id
 * @access  Private (Only the owner)
 */
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

/**
 * @desc    Update Restaurant Details
 * @route   PUT /api/restaurants/:id
 * @access  Private (Only the owner)
 */
export const updateRestaurant = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      contact,
      openingHours,
      menu,
      restaurantAdmin,
    } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant || restaurant.ownerId.toString() !== req.owner) {
      return res.status(403).json({ message: "Access denied!" });
    }

    if (restaurantAdmin?.password) {
      const hashedPassword = await bcrypt.hash(restaurantAdmin.password, 10);
      restaurant.restaurantAdmin.password = hashedPassword;
    }

    restaurant.name = name || restaurant.name;
    restaurant.description = description || restaurant.description;
    restaurant.address = address || restaurant.address;
    restaurant.contact = contact || restaurant.contact;
    restaurant.openingHours = openingHours || restaurant.openingHours;
    restaurant.menu = menu || restaurant.menu;
    restaurant.restaurantAdmin.username =
      restaurantAdmin?.username || restaurant.restaurantAdmin.username;

    await restaurant.save();
    res.json({ message: "Restaurant updated successfully!", restaurant });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * @desc    Delete a Restaurant
 * @route   DELETE /api/restaurants/:id
 * @access  Private (Only the owner)
 */
export const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant || restaurant.ownerId.toString() !== req.owner) {
      return res.status(403).json({ message: "Access denied!" });
    }
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found!" });
    }
    res.json({ message: "Restaurant deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const restaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    if (!restaurants || restaurants.length === 0) {
      return res.status(404).json({ message: "No restaurants found!" });
    }
    return res.json({ count: restaurants.length, restaurants });
  } catch (error) {
    console.log("Error in getting all restaurants", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const restaurantDishes = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: "Not found" });

    const dishes = await Dish.find({ _id: { $in: restaurant.dishes } });

    res.json({
      restaurantId: restaurant._id,
      name: restaurant.name,
      dishes,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRestaurantByOwnerId = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ ownerId: req.params.id });
    if (!restaurant) return res.status(404).json({ message: "Not found" });

    res.status(200).json({
      restaurant,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
