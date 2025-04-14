import CartItem from "../model/cartItem.js";
import axios from "axios";

const getRestaurants = async (authorization) => {
  try {
    const response = await axios.get(
      `${global.gConfig.restaurant_url}/api/restaurants`,
      { headers: { authorization } }
    );

    console.log(response);
    // Convert array to object with restaurant ID as key
    const restaurants = {};
    response.data.forEach((restaurant) => {
      restaurants[restaurant._id] = restaurant;
    });

    return restaurants;
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    throw new Error("Failed to fetch restaurant data");
  }
};

const getRestaurantById = async (authorization, restaurantId) => {
  try {
    const response = await axios.get(
      `${global.gConfig.restaurant_url}/api/restaurants/${restaurantId}`,
      { headers: { authorization } }
    );
    return response;
  } catch (error) {
    console.error("Error fetching restaurant:", error);
  }
};

const getRestaurantDishes = async (authorization, restaurantId) => {
  try {
    const response = await axios.get(
      `${global.gConfig.restaurant_url}/api/restaurants/${restaurantId}/dishes`,
      { headers: { authorization } }
    );
    return response;
  } catch (error) {
    console.error("Error fetching restaurant:", error);
  }
};

const getAllCartItems = async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch all cart items for the user
    const cartItems = await CartItem.find({ customerId: userId });

    if (!cartItems || cartItems.length === 0) {
      return res.status(200).json({
        restaurantDetails: null,
        items: [],
        totalCount: 0,
      });
    }

    // Get restaurant details for the restaurant in cart
    const restaurantId = cartItems[0].restaurantId.toString();
    const restaurantResponse = await getRestaurantById(
      req.headers.authorization,
      restaurantId
    );

    // Get all dishes for the restaurant
    const dishesResponse = await getRestaurantDishes(
      req.headers.authorization,
      restaurantId
    );

    // Format cart items with dish details
    const formattedItems = cartItems.map((item) => {
      // Find the dish in the restaurant's dishes
      const dish = dishesResponse?.data?.dishes?.find(
        (dish) => dish._id && dish._id.toString() === item.itemId.toString()
      );

      return {
        _id: item._id,
        itemId: item.itemId,
        item: dish || null,
        quantity: item.quantity,
        itemPrice: item.itemPrice,
        totalPrice: item.totalPrice,
      };
    });

    // Format the response
    const response = {
      restaurantDetails: restaurantResponse?.data || null,
      items: formattedItems,
      totalCount: cartItems.length,
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: 500, message: err.message || "Internal Server Error" });
  }
};

const addCartItem = async (req, res) => {
  const userId = req.user.id;

  try {
    const restaurant = await getRestaurantById(
      req.headers.authorization,
      req.body.restaurantId
    );

    if (!restaurant || !restaurant.data) {
      return res
        .status(404)
        .json({ status: 404, message: "Restaurant not found" });
    }

    const dish = restaurant.data?.dishes.find(
      (d) => d.toString() === req.body.itemId
    );
    if (!dish) {
      return res
        .status(404)
        .json({ status: 404, message: "Dish not found for restaurant" });
    }

    // Check if cart already has items from a different restaurant
    const existingCartItems = await CartItem.find({ customerId: userId });
    if (existingCartItems.length > 0) {
      const existingRestaurantId = existingCartItems[0].restaurantId.toString();
      if (existingRestaurantId !== req.body.restaurantId) {
        return res.status(400).json({
          status: 400,
          message:
            "Cannot add items from different restaurants. Please clear your cart first.",
        });
      }
    }

    // Check if the item already exists in the cart
    const existingItem = await CartItem.findOne({
      customerId: userId,
      itemId: req.body.itemId,
    });

    let savedItem;

    if (existingItem) {
      // If item exists, increment quantity
      existingItem.quantity += req.body.quantity || 1;
      savedItem = await existingItem.save();
    } else {
      // If item doesn't exist, create new cart item
      const newCartItem = new CartItem({
        customerId: userId,
        itemId: req.body.itemId,
        restaurantId: req.body.restaurantId,
        // itemPrice: dish.price,
        itemPrice: 100,
        quantity: req.body.quantity || 1,
      });
      savedItem = await newCartItem.save();
    }

    res.status(201).json({
      _id: savedItem._id,
      restaurantId: savedItem.restaurantId,
      itemId: savedItem.itemId,
      quantity: savedItem.quantity,
      totalPrice: savedItem.totalPrice,
    });
  } catch (err) {
    console.error(err);
    // Check if error is due to duplicate key (item already in cart)
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ status: 400, message: "Item already exists in cart" });
    }
    return res
      .status(500)
      .json({ status: 500, message: err.message || "Internal Server Error" });
  }
};

const updateCartItem = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ status: 400, message: "Invalid request: missing cart item ID" });
  }

  // Use authenticated user ID from req.user
  const userId = req.user.id;
  const { quantity, restaurantId } = req.body;

  // Fetch the restaurant details
  const restaurant = await getRestaurantById(
    req.headers.authorization,
    restaurantId
  );

  if (!restaurant || !restaurant.data) {
    return res
      .status(404)
      .json({ status: 404, message: "Restaurant not found" });
  }

  try {
    // Find the cart item by ID, customer ID, and restaurant ID
    const cartItem = await CartItem.findOne({
      itemId: id,
      customerId: userId,
      restaurantId: restaurantId,
    });

    if (!cartItem) {
      return res
        .status(404)
        .json({ status: 404, message: "Cart item not found" });
    }

    // Update the cart item fields
    cartItem.quantity = quantity;

    // Save updated cart item to MongoDB
    await cartItem.save();

    // Send updated response with dish details
    return res.status(200).json({
      ...cartItem._doc,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: 500, message: err.message || "Internal Server Error" });
  }
};

const deleteCartItem = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ status: 400, message: "Invalid request: missing cart item ID" });
  }

  // Use authenticated user ID from req.user
  const userId = req.user.id;

  try {
    // Find and delete the cart item
    const cartItem = await CartItem.findOneAndDelete({
      _id: id,
      customerId: userId,
    });

    if (!cartItem) {
      return res
        .status(404)
        .json({ status: 404, message: "Cart item not found" });
    }

    return res
      .status(200)
      .json({ status: 200, message: "Cart item deleted successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: 500, message: err.message || "Internal Server Error" });
  }
};

const resetCartItems = async (req, res) => {
  // Use authenticated user ID from req.user
  const userId = req.user.id;

  try {
    // Delete all cart items for the user
    const result = await CartItem.deleteMany({ customerId: userId });

    if (result.deletedCount >= 0) {
      return res.status(200).json({
        status: 200,
        message: "Cart reset successfully",
        deletedCount: result.deletedCount,
      });
    } else {
      return res.status(500).json({
        status: 500,
        message: "Failed to reset cart",
      });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: 500, message: err.message || "Internal Server Error" });
  }
};

// Update multiple cart items at once (for order review page)
const updateMultipleCartItems = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Items array is required",
      });
    }

    // Process each item update
    const updatePromises = items.map(async (item) => {
      const { id, quantity } = item;

      if (!id || !quantity) {
        throw new Error("Each item must have id and quantity");
      }

      if (quantity < 1) {
        // Delete item if quantity is 0
        return CartItem.findOneAndDelete({ _id: id, customerId });
      } else {
        // Update quantity if > 0
        return CartItem.findOneAndUpdate(
          { _id: id, customerId },
          { quantity: parseInt(quantity) },
          { new: true }
        );
      }
    });

    // Execute all updates
    const results = await Promise.all(updatePromises);

    // Get updated cart
    const updatedCart = await CartItem.find({ customerId });

    res.status(200).json({
      status: 200,
      message: "Cart items updated successfully",
      updatedCount: results.filter((r) => r !== null).length,
      cartItems: updatedCart,
    });
  } catch (error) {
    console.error("Error updating multiple cart items:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};

export {
  getAllCartItems,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  resetCartItems,
  updateMultipleCartItems,
};
