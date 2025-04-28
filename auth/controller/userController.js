import User from "../model/User.js";

/**
 * Get all users (admin use)
 * @route GET /api/users
 * @access Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    let query = {};

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    const users = await User.find(query).select("-password -refreshToken");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

/**
 * Get pending approval users
 * @route GET /api/users/pending-approval
 * @access Private/Admin
 */
const getPendingApprovalUsers = async (req, res) => {
  try {
    const users = await User.find({
      status: "pending_approval",
    }).select("-password -refreshToken");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get pending approval users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending approval users",
      error: error.message,
    });
  }
};

const getDrivers = async (req, res) => {
  try {
    const { status } = req.query; // Optional status filter (e.g., 'active', 'inactive')
    const query = { role: "delivery" }; // Fixed role = 'driver'

    // Add status filter if provided
    if (status) query.status = status;

    const drivers = await User.find(query).select("-password -refreshToken"); // Exclude sensitive fields

    res.status(200).json({
      success: true,
      count: drivers.length,
      drivers, // Returns only drivers
    });
  } catch (error) {
    console.error("Get drivers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch drivers",
      error: error.message,
    });
  }
};

/**
 * Approve user (for restaurant or delivery roles)
 * @route PUT /api/users/:id/approve
 * @access Private/Admin
 */
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status !== "pending_approval") {
      return res.status(400).json({
        success: false,
        message: "User is not in pending approval status",
      });
    }

    user.status = "active";
    await user.save();

    res.status(200).json({
      success: true,
      message: "User approved successfully",
      user,
    });
  } catch (error) {
    console.error("Approve user error:", error);
    res.status(500).json({
      success: false,
      message: "Error approving user",
      error: error.message,
    });
  }
};

/**
 * Update user's own profile
 * @route PUT /api/users/me
 * @access Private
 */
const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = {
      customer: ["name", "phone", "profilePicture"],
      restaurant: ["name", "phone", "profilePicture"],
      delivery: ["name", "phone", "profilePicture", "vehiclePlate"],
    };

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updates = {};
    const userRole = user.role;

    for (const field of allowedUpdates[userRole]) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    delete updates.role;
    delete updates.status;
    delete updates.email;
    delete updates.password;
    delete updates.addresses; // Explicitly prevent addresses from being updated here

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

/**
 * Delete user (admin use)
 * @route DELETE /api/users/:id
 * @access Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

/**
 * Update user status (admin use)
 * @route PUT /api/users/:id/status
 * @access Private/Admin
 */
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    console.log(status);

    const validStatuses = [
      "active",
      "inactive",
      "suspended",
      "pending_approval",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user status",
      error: error.message,
    });
  }
};

/**
 * Change password (user's own)
 * @route PUT /api/users/me/password
 * @access Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new passwords",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (currentPassword == newPassword) {
      return res.status(401).json({
        success: false,
        message: "New password cannot be the same as the current password",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};

/**
 * Toggle driver availability status
 * @route PUT /api/users/me/availability/toggle
 * @access Private/Delivery
 */
const toggleDriverAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if the user is a delivery driver
    if (user.role !== "delivery") {
      return res.status(403).json({
        success: false,
        message: "Only delivery drivers can update availability status",
      });
    }

    // Toggle the availability status
    user.driverIsAvailable = !user.driverIsAvailable;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Driver is now ${
        user.driverIsAvailable ? "available" : "unavailable"
      } for deliveries`,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        driverIsAvailable: user.driverIsAvailable,
      },
    });
  } catch (error) {
    console.error("Toggle driver availability error:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling driver availability",
      error: error.message,
    });
  }
};

/**
 * Get user addresses
 * @route GET /api/users/me/addresses
 * @access Private
 */
const getUserAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      addresses: user.addresses || [],
    });
  } catch (error) {
    console.error("Get user addresses error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching addresses",
      error: error.message,
    });
  }
};

/**
 * Add a new address for the user
 * @route POST /api/users/me/addresses
 * @access Private
 */
const addAddress = async (req, res) => {
  try {
    const { label, street, city, state, isDefault = false } = req.body;

    // Validate required fields
    if (!label || !street || !city || !state) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required address fields: label, street, city, state",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create the new address
    const newAddress = {
      label,
      street,
      city,
      state,
      isDefault: false, // Default to false initially
      coordinates: req.body.coordinates || { lat: null, lng: null },
    };

    // If this is marked as default or it's the first address, handle default logic
    if (isDefault || user.addresses.length === 0) {
      // If it's the first address or marked as default, set all existing addresses to non-default
      if (user.addresses.length > 0) {
        user.addresses.forEach((address) => {
          address.isDefault = false;
        });
      }
      newAddress.isDefault = true;
    }

    // Add the new address
    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding address",
      error: error.message,
    });
  }
};

/**
 * Update an existing address
 * @route PUT /api/users/me/addresses/:addressId
 * @access Private
 */
const updateAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    const { label, street, city, state, isDefault, coordinates } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the address to update
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Update address fields if provided
    if (label) user.addresses[addressIndex].label = label;
    if (street) user.addresses[addressIndex].street = street;
    if (city) user.addresses[addressIndex].city = city;
    if (state) user.addresses[addressIndex].state = state;
    if (coordinates) user.addresses[addressIndex].coordinates = coordinates;

    // Handle default address logic
    if (isDefault === true && !user.addresses[addressIndex].isDefault) {
      // Set all addresses to non-default
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
      // Set this address as default
      user.addresses[addressIndex].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address: user.addresses[addressIndex],
    });
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating address",
      error: error.message,
    });
  }
};

/**
 * Set an address as default
 * @route PUT /api/users/me/addresses/:addressId/default
 * @access Private
 */
const setDefaultAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the address
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Set all addresses to non-default
    user.addresses.forEach((address) => {
      address.isDefault = false;
    });

    // Set the selected address as default
    user.addresses[addressIndex].isDefault = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      address: user.addresses[addressIndex],
    });
  } catch (error) {
    console.error("Set default address error:", error);
    res.status(500).json({
      success: false,
      message: "Error setting default address",
      error: error.message,
    });
  }
};

/**
 * Remove an address
 * @route DELETE /api/users/me/addresses/:addressId
 * @access Private
 */
const removeAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the address
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Check if it's the default address
    const isDefault = user.addresses[addressIndex].isDefault;

    // Remove the address
    user.addresses.splice(addressIndex, 1);

    // If the removed address was the default and there are other addresses,
    // set the first one as default
    if (isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address removed successfully",
    });
  } catch (error) {
    console.error("Remove address error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing address",
      error: error.message,
    });
  }
};

export {
  getAllUsers,
  getPendingApprovalUsers,
  approveUser,
  updateProfile,
  deleteUser,
  updateUserStatus,
  changePassword,
  toggleDriverAvailability,
  getUserAddresses,
  addAddress,
  updateAddress,
  setDefaultAddress,
  removeAddress,
  getDrivers,
};
