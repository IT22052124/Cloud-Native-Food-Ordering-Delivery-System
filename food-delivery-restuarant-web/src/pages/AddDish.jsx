import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDish } from "../utils/api.js";
import Sidebar from "../components/Sidebar.jsx";
import Toast from "../components/Toast.jsx";
import { toast } from "react-toastify";

function AddDish() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    isAvailable: true,
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDish({ ...formData, price: parseFloat(formData.price) });
      toast.success("Dish added successfully");
      navigate("/restaurant-admin/manage-dishes");
    } catch (err) {
      toast.error("Failed to add dish");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6">
        <Toast />
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Add Dish</h2>
        <form
          onSubmit={handleSubmit}
          className="max-w-lg bg-white p-6 rounded-lg shadow-sm"
        >
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Price (LKR)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-gray-700 font-medium">Available</span>
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Dish
          </button>
        </form>
      </div>
    </div>
  );
}
export default AddDish;
