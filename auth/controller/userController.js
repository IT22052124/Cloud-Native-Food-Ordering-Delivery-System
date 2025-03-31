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
      customer: ["name", "phone", "address", "profilePicture"],
      restaurant: ["name", "phone", "address", "profilePicture"],
      delivery: ["name", "phone", "address", "profilePicture", "vehiclePlate"],
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

export {
  getAllUsers,
  getPendingApprovalUsers,
  approveUser,
  updateProfile,
  deleteUser,
  updateUserStatus,
  changePassword,
};
