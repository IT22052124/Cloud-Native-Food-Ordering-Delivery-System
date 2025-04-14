import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { addRestaurant } from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { toast } from "react-toastify";

const schema = zod.object({
  name: zod.string().min(1, "Name is required"),
  description: zod.string().optional(),
  address: zod.object({
    street: zod.string().min(1, "Street is required"),
    city: zod.string().min(1, "City is required"),
    province: zod.string().min(1, "Province is required"),
    postalCode: zod.string().min(1, "Postal code is required"),
    coordinates: zod.object({
      lat: zod.number().min(-90).max(90, "Invalid latitude"),
      lng: zod.number().min(-180).max(180, "Invalid longitude"),
    }),
  }),
  contact: zod.object({
    phone: zod.string().min(1, "Phone is required"),
    email: zod.string().email("Invalid email").optional().or(zod.literal("")),
  }),
  openingHours: zod.object({
    open: zod.string().min(1, "Open time is required"),
    close: zod.string().min(1, "Close time is required"),
    isClosed: zod.boolean(),
  }),
  restaurantAdmin: zod.object({
    username: zod.string().min(1, "Username is required"),
    password: zod.string().min(6, "Password must be at least 6 characters"),
  }),
  media: zod
    .array(
      zod.object({
        url: zod.string().url("Invalid URL").optional(),
        alt_text: zod.string().optional(),
      })
    )
    .optional(),
});

const AddRestaurant = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      address: { coordinates: { lat: 0, lng: 0 } },
      contact: { phone: "", email: "" },
      openingHours: { open: "", close: "", isClosed: false },
      restaurantAdmin: { username: "", password: "" },
      media: [{ url: "", alt_text: "" }],
    },
  });

  const onSubmit = async (data) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await addRestaurant({
        ...data,
        ownerId: user.id,
        restaurantAdmin: [data.restaurantAdmin],
      });
      toast.success("Restaurant added successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add restaurant");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">
            Add Restaurant
          </h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-6 rounded-lg shadow dark:bg-gray-800"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">
                  Name
                </label>
                <input
                  {...register("name")}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.name && (
                  <p className="text-red-600 dark:text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">
                  Street
                </label>
                <input
                  {...register("address.street")}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.address?.street && (
                  <p className="text-red-600 dark:text-red-400">
                    {errors.address.street.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">
                  City
                </label>
                <input
                  {...register("address.city")}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.address?.city && (
                  <p className="text-red-600 dark:text-red-400">
                    {errors.address.city.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">
                  Province
                </label>
                <input
                  {...register("address.province")}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.address?.province && (
                  <p className="text-red-600 dark:text-red-400">
                    {errors.address.province.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">
                  Postal Code
                </label>
                <input
                  {...register("address.postalCode")}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.address?.postalCode && (
                  <p className="text-red-600 dark:text-red-400">
                    {errors.address.postalCode.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  {...register("address.coordinates.lat", {
                    valueAsNumber: true,
                  })}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.address?.coordinates?.lat && (
                  <p className="text-red-600 dark:text-red-400">
                    {errors.address.coordinates.lat.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  {...register("address.coordinates.lng", {
                    valueAsNumber: true,
                  })}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.address?.coordinates?.lng && (
                  <p className="text-red-600 dark:text-red-400">
                    {errors.address.coordinates.lng.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">
                  Phone
                </label>
                <input
                  {...register("contact.phone")}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.contact?.phone && (
                  <p className="text-red-600 dark:text-red-400">
                    {errors.contact.phone.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">
                  Email
                </label>
                <input
                  {...register("contact.email")}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.contact?.email && (
                  <p className="text-red-600 dark:text-red-400">
                    {errors.contact.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">
                  Open Time
                </label>
                <input
                  {...register("openingHours.open")}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.openingHours?.open && (
                  <p className="text-red-600 dark:text-red-400">
                    {errors.openingHours.open.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">
                  Close Time
                </label>
                <input
                  {...register("openingHours.close")}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.openingHours?.close && (
                  <p className="text-red-600 dark:text-red-400">
                    {errors.openingHours.close.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">
                  Closed
                </label>
                <input
                  type="checkbox"
                  {...register("openingHours.isClosed")}
                  className="p-3"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">
                  Admin Username
                </label>
                <input
                  {...register("restaurantAdmin.username")}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.restaurantAdmin?.username && (
                  <p className="text-red-600 dark:text-red-400">
                    {errors.restaurantAdmin.username.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">
                  Admin Password
                </label>
                <input
                  type="password"
                  {...register("restaurantAdmin.password")}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.restaurantAdmin?.password && (
                  <p className="text-red-600 dark:text-red-400">
                    {errors.restaurantAdmin.password.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">
                  Media URL
                </label>
                <input
                  {...register("media.0.url")}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.media?.[0]?.url && (
                  <p className="text-red-600 dark:text-red-400">
                    {errors.media[0].url.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-gray-300">
                  Media Alt Text
                </label>
                <input
                  {...register("media.0.alt_text")}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Add Restaurant
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRestaurant;
