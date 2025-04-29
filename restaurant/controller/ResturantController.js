import { Restaurant } from "../model/resturant.js";
import { Dish } from "../model/dish.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { ref, deleteObject } from "firebase/storage";
import { sendKafkaNotification } from "shared-kafka";
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
      credentials, // Expect an array of { username, password }
      imageUrls,
      coverImageUrl,
      openingHours, // Updated to expect an array
      accountNumber,
      accountHolderName,
      bankName,
      branch,
      serviceType,
      cuisineType,
      estimatedPrepTime,
    } = req.body;
// Validate credentials array
if (!Array.isArray(credentials) || credentials.length === 0) {
  return res.status(400).json({
    message: 'At least one credential pair is required',
  });
}
   // Check for duplicate usernames across all restaurants
   const existingUsernames = await Restaurant.find({
    'restaurantAdmin.username': { $in: credentials.map(cred => cred.username) },
  });
  if (existingUsernames.length > 0) {
    const duplicateUsernames = existingUsernames
      .flatMap(rest => rest.restaurantAdmin.map(admin => admin.username))
      .filter(username => credentials.some(cred => cred.username === username));
    return res.status(400).json({
      message: `Usernames already exist: ${duplicateUsernames.join(', ')}`,
    });
  }

    const exist = await Restaurant.findOne({
      "address.street": street,
      "address.city": city,
    });
    if (exist) {
      return res.status(400).json({
        message: "Restaurant already exists in this location.",
      });
    }

   // Hash all passwords in the credentials array
   const hashedCredentials = await Promise.all(
    credentials.map(async (cred) => {
      if (!cred.username || !cred.password) {
        throw new Error('Username and password are required for all credentials');
      }
      const hashedPassword = await bcrypt.hash(cred.password, 10);
      return {
        username: cred.username,
        password: hashedPassword,
      };
    })
  );

    // Default opening hours if none provided
    const defaultOpeningHours = [
      { day: "Monday", open: "09:00", close: "18:00", isClosed: false },
      { day: "Tuesday", open: "09:00", close: "18:00", isClosed: false },
      { day: "Wednesday", open: "09:00", close: "18:00", isClosed: false },
      { day: "Thursday", open: "09:00", close: "18:00", isClosed: false },
      { day: "Friday", open: "09:00", close: "17:00", isClosed: false },
      { day: "Saturday", open: "10:00", close: "14:00", isClosed: false },
      { day: "Sunday", open: null, close: null, isClosed: true },
    ];

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
    restaurantAdmin: hashedCredentials, // Store array of credentials
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      coverImageUrl: coverImageUrl || " ",
      isVerified: "pending",
      cuisineType: cuisineType,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
      bank: {
        accountNumber: accountNumber,
        accountHolderName: accountHolderName,
        bankName: bankName,
        branch: branch,
      },
      serviceType: serviceType,
     openingHours: Array.isArray(openingHours)
        ? openingHours
        : defaultOpeningHours, // Use provided hours or default
      estimatedPrepTime: estimatedPrepTime,
      estimatedPrepTime: estimatedPrepTime,
    };

    const resturants = await Restaurant.create(restaurant);

    const kafkaMessage = {
      topic: "restaurant-registrations",
      type: "NEW_RESTAURANT_REGISTERED",
      restaurantId: resturants._id.toString(),
      name: resturants.name,
      ownerId: resturants.ownerId, // Include ownerId from JWT
      ownerEmail: resturants.contact.email, // Fixed: Get email from contact object
      address: resturants.address,
      status: resturants.isVerified, // Use the actual field from your schema
      timestamp: new Date().toISOString(),
      metadata: {
        // Additional useful data
        cuisineType: resturants.cuisineType,
        location: resturants.location,
        requiresApproval: true, // Explicit flag
      },
    };

    await sendKafkaNotification(kafkaMessage)
      .then(() => console.log("✅ Kafka message sent successfully"))
      .catch((err) => console.error("❌ Kafka send failed:", err));

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
export const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();

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
      openingHours, // Updated to expect an array 
           bank,
      serviceType,
      cuisineType,
      estimatedPrepTime,
    } = req.body;

    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant || restaurant.ownerId.toString() !== req.owner) {
      return res.status(403).json({ message: "Access denied!" });
    }

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
    if (restaurant.coverImageUrl) {
      try {
        const imageRef = ref(storage, restaurant.coverImageUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.error(
          `Failed to delete cover image ${restaurant.coverImageUrl}:`,
          error
        );
      }
    }

    for (const imageUrl of restaurant.imageUrls) {
      try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.error(`Failed to delete image ${imageUrl}:`, error);
      }
    }
    res.json({ message: "Restaurant deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

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

    // Check if the requester is the owner
    if (restaurant.ownerId.toString() !== req.owner) {
      return res.status(403).json({ message: "Access denied!" });
    }

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

export const restaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    if (!restaurants || restaurants.length === 0) {
      return res.status(404).json({ message: "No restaurants found!" });
    }
    return res.json({
      count: restaurants.length,
      restaurants,
    });
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

export const getFoodCategories = (req, res) => {
  const categories = [
    {
      id: 1,
      name: "Appetizers",
      image:
        "https://www.eatingwell.com/thmb/VZOpYLlkdhow-YKvWLTlotmVRjY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/loaded-smashed-brussels-sprouts-4f5ab837d61d40c8a5bf27a398ca29eb.jpg",
    },
    {
      id: 2,
      name: "Main Course",
      image:
        "https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_600,h_400/https://thefoodcafe.com/wp-content/uploads/2018/04/Bacon-wrapped-jalapeno-Chicken-600x400.jpg",
    },
    {
      id: 3,
      name: "Desserts",
      image:
        "https://www.tasteofhome.com/wp-content/uploads/2019/05/Fried-Ice-Cream-Dessert-Bars-_EXPS_SDJJ19_232652_B02_06_1b_rms-2.jpg",
    },
    {
      id: 4,
      name: "Beverages",
      image:
        "https://media.istockphoto.com/id/1303977605/photo/five-cocktails-in-hands-joined-in-celebratory-toast.jpg?s=612x612&w=0&k=20&c=QtnWuVeQCwKOfXIISxfkuDhQTe15qnnKOFKgpcH1Vko=",
    },
    {
      id: 5,
      name: "Salads",
      image:
        "https://i2.wp.com/www.downshiftology.com/wp-content/uploads/2019/04/Cobb-Salad-main.jpg",
    },
    {
      id: 6,
      name: "Soups",
      image:
        "https://cdn.loveandlemons.com/wp-content/uploads/2023/01/tomato-soup-recipe.jpg",
    },
    {
      id: 7,
      name: "Breads",
      image:
        "https://www.allrecipes.com/thmb/CjzJwg2pACUzGODdxJL1BJDRx9Y=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/6788-amish-white-bread-DDMFS-4x3-6faa1e552bdb4f6eabdd7791e59b3c84.jpg",
    },
    {
      id: 8,
      name: "Rice Dishes",
      image:
        "https://www.allrecipes.com/thmb/NVjvH6r7xOrcoxmA-OjPs3uSmUA=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/RM-33385-best-spanish-rice-ddmfs-3x4-054478cf67f14ffebc114d2d18639634.jpg",
    },
    {
      id: 9,
      name: "Noodles",
      image:
        "https://takestwoeggs.com/wp-content/uploads/2023/11/Soy-Sauce-Pan-Fried-Noodles-Takestwoeggs-sq.jpg",
    },
    {
      id: 10,
      name: "Seafood",
      image:
        "https://assets.epicurious.com/photos/54b87c137cbba01c0db7ff8d/1:1/w_2560%2Cc_limit/51248830_cioppino_1x1.jpg",
    },
    {
      id: 11,
      name: "Grilled",
      image:
        "https://assets.epicurious.com/photos/5b843bce1abfc56568396369/1:1/w_2560%2Cc_limit/Grilled-Chicken-with-Mustard-Sauce-and-Tomato-Salad-recipe-2-22082018.jpg",
    },
    {
      id: 12,
      name: "Fast Food",
      image:
        "https://www.summahealth.org/-/media/project/summahealth/website/page-content/flourish/2_18a_fl_fastfood_400x400.webp?la=en&h=400&w=400&hash=145DC0CF6234A159261389F18A36742A",
    },
  ];

  return res.status(200).json({
    success: true,
    categories,
  });
};

/**
 * @desc    Update restaurant verification status (Admin-only)
 * @route   PATCH /api/restaurants/:id/verify
 * @access  Private (Admin)
 */
// mufeez this
export const updateRestaurantVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    // 1. Validate input
    if (
      !isVerified ||
      !["active", "suspended", "pending"].includes(isVerified)
    ) {
      return res.status(400).json({
        message:
          "Invalid status. Must be: 'active', 'suspended', or 'pending'.",
      });
    }

    // 2. Check if restaurant exists
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    // 3. Verify requester is an admin (add your admin check logic here)
    // Example: if (!req.user.isAdmin) return res.status(403).json(...);

    // 4. Update only the `isVerified` field
    restaurant.isVerified = isVerified;
    await restaurant.save();

    res.json({
      message: `Restaurant verification status updated to '${isVerified}'.`,
      restaurant,
    });
  } catch (error) {
    console.error("Error updating verification status:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * @desc    Get restaurants within a specific location range
 * @route   GET /api/restaurants/nearby
 * @access  Public
 */
export const getRestaurantsByLocation = async (req, res) => {
  try {
    const { lat, lng, range } = req.query;

    // Validate required parameters
    if (!lat || !lng || !range) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters: lat, lng, and range are required",
      });
    }

    // Convert string parameters to numbers
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInKm = parseFloat(range);

    // Validate parameter values
    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusInKm)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid parameters: lat, lng, and range must be valid numbers",
      });
    }

    if (radiusInKm <= 0) {
      return res.status(400).json({
        success: false,
        message: "Range must be greater than 0",
      });
    }

    // Use MongoDB's $geoNear aggregation for efficient geospatial querying
    const restaurants = await Restaurant.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude], // MongoDB uses [lng, lat] order
          },
          distanceField: "distance",
          maxDistance: radiusInKm * 1000, // Convert km to meters
          spherical: true,
          distanceMultiplier: 0.001, // Convert meters back to kilometers
          query: { isActive: true }, // Add any additional filters here
        },
      },
      {
        $project: {
          // Include all fields plus the calculated distance
          name: 1,
          ownerId: 1,
          description: 1,
          address: 1,
          contact: 1,
          openingHours: 1,
          isActive: 1,
          imageUrls: 1,
          dishes: 1,
          coverImageUrl: 1,
          serviceType: 1,
          cuisineType: 1,
          isVerified: 1,
          reviews: 1,
          estimatedPrepTime: 1,
          location: 1,
          distance: { $round: ["$distance", 2] }, // Round distance to 2 decimal places
        },
      },
      {
        $sort: { distance: 1 }, // Sort by distance (nearest first)
      },
    ]);

    if (restaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No restaurants found within the specified range",
      });
    }

    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.log("Error in getting nearby restaurants", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Search restaurants by name or cuisine type
 * @route   GET /api/restaurants/search
 * @access  Public
 */
export const searchRestaurants = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Create a case-insensitive regex for the search term
    const searchRegex = new RegExp(query, "i");

    // Search in name and cuisineType fields
    const restaurants = await Restaurant.find({
      $or: [
        { name: { $regex: searchRegex } },
        { cuisineType: { $regex: searchRegex } },
      ],
    });

    if (restaurants.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No restaurants found matching your search",
        restaurants: [],
      });
    }

    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.log("Error in searching restaurants", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/* @desc    Get all restaurants for the current owner
 * @route   GET /api/restaurants/my-restaurants
 * @access  Private (Owner only)
 */
export const getMyRestaurants = async (req, res) => {
  try {
    const ownerId = req.owner; // From JWT middleware
    const restaurants = await Restaurant.find({ ownerId ,
      isVerified:"active"
    });

    if (!restaurants || restaurants.length === 0) {
      return res.status(404).json({
        message: "You don't have any restaurants yet!",
      });
    }

    res.json({
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getMypendingRestaurants = async (req, res) => {
  try {
    const ownerId = req.owner; // From JWT middleware
    const restaurants = await Restaurant.find({ ownerId ,
      isVerified:"pending"
    });

    if (!restaurants || restaurants.length === 0) {
      return res.status(404).json({
        message: "You don't have any restaurants yet!",
      });
    }

    res.json({
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
