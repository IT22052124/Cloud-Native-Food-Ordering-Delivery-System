import React, { createContext, useState, useContext, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "./AuthContext";
import dataService from "../services/dataService";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load cart from API or storage on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartFromApi();
    } else {
      loadCartFromStorage();
    }
  }, [isAuthenticated]);

  // Save cart to storage whenever it changes (as backup)
  useEffect(() => {
    if (!loading) {
      saveCartToStorage();
    }
  }, [items, restaurant, loading]);

  const fetchCartFromApi = async () => {
    try {
      setLoading(true);
      const cartData = await dataService.getCart();
      if (cartData && cartData.items && cartData.items.length > 0) {
        setItems(
          cartData.items.map((item) => ({
            id: item._id, // Cart item ID used for updating/removing
            itemId: item.itemId, // Actual menu item ID
            name: item.item?.name || "",
            price: item.itemPrice,
            quantity: item.quantity,
            image: item.item?.image || "",
            totalPrice: item.totalPrice,
          }))
        );

        if (cartData.restaurantDetails) {
          setRestaurant({
            id: cartData.restaurantDetails._id,
            name: cartData.restaurantDetails.name,
            image:
              cartData.restaurantDetails.coverImage ||
              cartData.restaurantDetails.image,
            deliveryFee: cartData.restaurantDetails.deliveryFee || "2.99",
            deliveryTime:
              cartData.restaurantDetails.deliveryTime || "30-45 min",
          });
        }
      } else {
        setItems([]);
        setRestaurant(null);
      }
    } catch (error) {
      console.error("Failed to fetch cart from API:", error);
      // Fallback to local storage if API fails
      loadCartFromStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadCartFromStorage = async () => {
    try {
      const storedCart = await SecureStore.getItemAsync("cart");
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setItems(parsedCart.items || []);
        setRestaurant(parsedCart.restaurant || null);
      }
    } catch (error) {
      console.error("Failed to load cart from storage:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveCartToStorage = async () => {
    try {
      const cartData = {
        items,
        restaurant,
      };
      await SecureStore.setItemAsync("cart", JSON.stringify(cartData));
    } catch (error) {
      console.error("Failed to save cart to storage:", error);
    }
  };

  const addItem = async (item, restaurantData) => {
    // If cart is empty or has items from the same restaurant
    // if (!restaurant || restaurant.id === restaurantData.id) {
    const existingItemIndex = items.findIndex(
      (cartItem) => cartItem.itemId === item.id
    );

    if (isAuthenticated) {
      try {
        // If the item exists, update quantity. Otherwise add new item
        const quantity =
          existingItemIndex !== -1 ? items[existingItemIndex].quantity + 1 : 1;

        await dataService.addToCart({
          itemId: "67fd4bc83e8d227072f02ac2", //item.id,
          restaurantId: "67fd4b623e8d227072f02ab4", //restaurantData.id,
          quantity: quantity,
          itemPrice: 100, //item.price,
        });

        // Refresh cart from API to ensure consistency
        await fetchCartFromApi();
        return { success: true };
      } catch (error) {
        console.error("Failed to add item to cart:", error);
        // If error is about different restaurant, return appropriate response
        if (error.response?.data?.message?.includes("different restaurant")) {
          return {
            requiresConfirmation: true,
            currentRestaurant: restaurant,
          };
        }
        return { error: error.message };
      }
    } else {
      // Local cart management for non-authenticated users
      if (existingItemIndex !== -1) {
        // Item already exists in cart, increment quantity
        const updatedItems = [...items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
          totalPrice:
            updatedItems[existingItemIndex].price *
            (updatedItems[existingItemIndex].quantity + 1),
        };
        setItems(updatedItems);
      } else {
        // Add new item to cart
        setItems([
          ...items,
          {
            id: Math.random().toString(36).substring(2, 15),
            itemId: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1,
            totalPrice: item.price,
          },
        ]);
      }

      // Set restaurant if not already set
      if (!restaurant) {
        setRestaurant(restaurantData);
      }
    }

    return { success: true };
    // } else {
    //   // Items from different restaurant, ask user if they want to clear cart
    //   return {
    //     requiresConfirmation: true,
    //     currentRestaurant: restaurant,
    //   };
    // }
  };

  const removeItem = async (cartId) => {
    if (isAuthenticated) {
      try {
        await dataService.deleteCartItem(cartId);
        await fetchCartFromApi();
      } catch (error) {
        console.error("Failed to remove item from cart:", error);
      }
    } else {
      const updatedItems = items.filter((item) => item.id !== itemId);
      setItems(updatedItems);

      // If cart is empty, clear restaurant as well
      if (updatedItems.length === 0) {
        setRestaurant(null);
      }
    }
  };

  const updateQuantity = async (cartId, itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    if (isAuthenticated) {
      try {
        await dataService.updateCartItem(cartId, {
          itemId,
          quantity,
          restaurantId: restaurant?.id,
        });
        await fetchCartFromApi();
      } catch (error) {
        console.error("Failed to update cart item quantity:", error);
      }
    } else {
      const updatedItems = items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              totalPrice: item.price * quantity,
            }
          : item
      );
      setItems(updatedItems);
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await dataService.resetCart();
        await fetchCartFromApi();
      } catch (error) {
        console.error("Failed to clear cart:", error);
        // Fallback to local clear
        setItems([]);
        setRestaurant(null);
      }
    } else {
      setItems([]);
      setRestaurant(null);
    }
  };

  const replaceCart = async (newItems, newRestaurant) => {
    if (isAuthenticated) {
      try {
        // First, clear the cart
        await clearCart();

        // Then add all new items
        for (const item of newItems) {
          await dataService.addToCart({
            itemId: item.itemId || item.id,
            restaurantId: newRestaurant.id,
            quantity: item.quantity,
            itemPrice: item.price,
          });
        }

        await fetchCartFromApi();
      } catch (error) {
        console.error("Failed to replace cart:", error);
        // Fallback to local replacement
        setItems(newItems);
        setRestaurant(newRestaurant);
      }
    } else {
      setItems(newItems);
      setRestaurant(newRestaurant);
    }
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    console.log(subtotal);
    const deliveryFee = restaurant ? parseFloat(restaurant.deliveryFee) : 0;
    return subtotal + deliveryFee;
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        restaurant,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        replaceCart,
        getSubtotal,
        getTotal,
        getItemCount,
        refreshCart: fetchCartFromApi,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartContext;
