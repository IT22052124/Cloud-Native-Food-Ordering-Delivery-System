import React, { createContext, useState, useContext, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "./AuthContext";
import dataService from "../services/dataService";
import { calculateTax, calculateTotalWithTax } from "../utils/taxUtils";

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
            id: item._id,
            itemId: item.itemId,
            name: item.item?.name || "",
            displayName: item.isPortionItem
              ? `${item.item?.name || ""} (${item.portionName})`
              : item.item?.name || "",
            price: item.itemPrice,
            quantity: item.quantity,
            image: item.item?.imageUrls[0] || "",
            totalPrice: item.totalPrice,
            // Add portion information if it exists
            ...(item.isPortionItem && {
              portionId: item.portionId,
              portionName: item.portionName,
              isPortionItem: true,
              portion: item.portion || {
                size: item.portionName,
                price: item.itemPrice,
              },
            }),
          }))
        );

        if (cartData.restaurantDetails) {
          setRestaurant({
            id: cartData.restaurantDetails._id,
            name: cartData.restaurantDetails.name,
            image:
              cartData.restaurantDetails.imageUrls[0] ||
              cartData.restaurantDetails.coverImageUrl,
            deliveryFee: cartData.restaurantDetails.deliveryFee || "0",
            deliveryTime:
              cartData.restaurantDetails.deliveryTime || "30-45 min",
            address: {
              city: cartData.restaurantDetails.address.city,
              province: cartData.restaurantDetails.address.province,
              street: cartData.restaurantDetails.address.street,
              coordinates: cartData.restaurantDetails.address.coordinates,
            },
            serviceType: cartData.restaurantDetails.serviceType,
          });
        }
      } else {
        setItems([]);
        setRestaurant(null);
      }
    } catch (error) {
      console.error("Failed to fetch cart from API:", error);
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
    // For portions, we need to match both itemId and portionId exactly
    const existingItemIndex = items.findIndex(
      (cartItem) =>
        cartItem.itemId === item._id &&
        (item.selectedPortion
          ? cartItem.portionId === item.selectedPortion._id
          : !cartItem.isPortionItem)
    );

    if (isAuthenticated) {
      try {
        const cartItemData = {
          itemId: item._id,
          restaurantId: restaurantData._id,
          quantity: item.quantity || 1,
          itemPrice: item.selectedPortion
            ? item.selectedPortion.price
            : item.price,
        };

        // Add portion data if a portion is selected
        if (item.selectedPortion) {
          cartItemData.portionId = item.selectedPortion._id;
          cartItemData.portionName = item.selectedPortion.size;
          cartItemData.isPortionItem = true;
        }

        const result = await dataService.addToCart(cartItemData);

        // Refresh cart from API to ensure consistency
        await fetchCartFromApi();
        return { success: true };
      } catch (error) {
        console.error("Failed to add item to cart:", error);
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
        // Item exists in cart, increment quantity
        const updatedItems = [...items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity:
            updatedItems[existingItemIndex].quantity + (item.quantity || 1),
          totalPrice:
            updatedItems[existingItemIndex].price *
            (updatedItems[existingItemIndex].quantity + (item.quantity || 1)),
        };
        setItems(updatedItems);
      } else {
        // Add new item to cart
        const newCartItem = {
          id: Math.random().toString(36).substring(2, 15),
          itemId: item._id,
          name: item.name,
          displayName: item.selectedPortion
            ? `${item.name} (${item.selectedPortion.size})`
            : item.name,
          price: item.selectedPortion ? item.selectedPortion.price : item.price,
          image: item.imageUrls?.[0] || item.image,
          quantity: item.quantity || 1,
        };

        // Add portion information if available
        if (item.selectedPortion) {
          newCartItem.portionId = item.selectedPortion._id;
          newCartItem.portionName = item.selectedPortion.size;
          newCartItem.isPortionItem = true;
          newCartItem.portion = {
            size: item.selectedPortion.size,
            price: item.selectedPortion.price,
          };
        }

        newCartItem.totalPrice = newCartItem.price * newCartItem.quantity;
        setItems([...items, newCartItem]);
      }

      // Set restaurant if not already set
      if (!restaurant) {
        setRestaurant(restaurantData);
      }
    }

    return { success: true };
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

  const getTax = () => {
    const subtotal = getSubtotal();
    const deliveryFee = restaurant
      ? parseFloat(restaurant.deliveryFee || 0)
      : 0;
    return calculateTax(subtotal, true, deliveryFee);
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const deliveryFee = restaurant
      ? parseFloat(restaurant.deliveryFee || 0)
      : 0;

    const { total } = calculateTotalWithTax(subtotal, deliveryFee, true);
    return total;
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
        getTax,
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
