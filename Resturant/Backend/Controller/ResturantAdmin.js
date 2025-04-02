import Restaurant from "../Models/Restaurant.js";

export const restaurantAdminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const restaurant = await Restaurant.findOne({ "restaurantAdmin.username": username });
    if (!restaurant) return res.status(401).json({ message: "Restaurant not found!" });

    const isMatch = await bcrypt.compare(password, restaurant.restaurantAdmin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials!" });

    const token = jwt.sign(
      { restaurantId: restaurant._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, restaurantId: restaurant._id, message: "Restaurant login successful!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
