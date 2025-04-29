"use client"

import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { toast } from "react-toastify"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "../../../firebase-config"
import { signup } from "../../utils/api"

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    nic: "",
    nicImage: null,
    profilePicture: null,
    password: "",
    role: "restaurant",
    addresses: [{ label: "", street: "", city: "", state: "", isDefault: true }],
  })
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (files) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleAddressChange = (index, field, value) => {
    setFormData((prev) => {
      const newAddresses = [...prev.addresses]
      newAddresses[index][field] = value
      return { ...prev, addresses: newAddresses }
    })
  }

  const addAddress = () => {
    setFormData((prev) => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        { label: "", street: "", city: "", state: "", isDefault: false },
      ],
    }))
  }

  const removeAddress = (index) => {
    setFormData((prev) => {
      const newAddresses = prev.addresses.filter((_, i) => i !== index)
      if (newAddresses.length > 0 && !newAddresses.some((addr) => addr.isDefault)) {
        newAddresses[0].isDefault = true
      }
      return { ...prev, addresses: newAddresses }
    })
  }

  const setDefaultAddress = (index) => {
    setFormData((prev) => {
      const newAddresses = prev.addresses.map((addr, i) => ({
        ...addr,
        isDefault: i === index,
      }))
      return { ...prev, addresses: newAddresses }
    })
  }

  const handleImageUpload = async (file, field) => {
    if (!file) return null
    try {
      setUploading(true)
      setError("")
      setUploadProgress(0)

      const storageRef = ref(storage, `user-documents/${field}/${file.name}-${Date.now()}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)

      setUploadProgress(100)
      setUploading(false)
      return url
    } catch (error) {
      setError(`Failed to upload ${field}.`)
      setUploading(false)
      setUploadProgress(0)
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (
      !formData.email ||
      !formData.name ||
      !formData.phone ||
      !formData.nic ||
      !formData.nicImage ||
      !formData.password
    ) {
      toast.error("All required fields must be filled")
      setLoading(false)
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Invalid email format")
      setLoading(false)
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    // Validate phone format
    const phoneRegex = /^\+?\d{10,15}$/
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Invalid phone number")
      setLoading(false)
      return
    }

    // Validate addresses
    for (const addr of formData.addresses) {
      if (!addr.label || !addr.street || !addr.city || !addr.state) {
        toast.error("All address fields are required")
        setLoading(false)
        return
      }
    }

    if (formData.addresses.length === 0) {
      toast.error("At least one address is required")
      setLoading(false)
      return
    }

    try {
      // Upload nicImage to Firebase
      const nicImageUrl = await handleImageUpload(formData.nicImage, "nicImage")
      if (!nicImageUrl) {
        toast.error("Failed to upload NIC image")
        setLoading(false)
        return
      }

      // Upload profilePicture to Firebase (optional)
      let profilePictureUrl = ""
      if (formData.profilePicture) {
        profilePictureUrl = await handleImageUpload(formData.profilePicture, "profilePicture")
      }

      // Prepare data for API
      const submitData = {
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        nic: formData.nic,
        nicImage: nicImageUrl,
        profilePicture: profilePictureUrl,
        password: formData.password,
        addresses: formData.addresses,
      }

      // API call to signup
      const result = await signup(submitData)
      login(result.token, "restaurant")
      toast.success("Signup successful! Awaiting approval.")
      navigate("/signup/confirmation")
    } catch (error) {
      toast.error(error.message || "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 dark:bg-gray-900">
      <div className="w-full max-w-3xl mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-orange-500 p-6">
            <h2 className="text-2xl font-bold text-white text-center">Join FoodDash</h2>
            <p className="text-orange-100 text-center mt-1">Sign up as a restaurant owner</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200">
                  Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                    placeholder="Your restaurant name"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                </div>
              </div>

              {/* Phone */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                    placeholder="+1234567890"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                </div>
              </div>

              {/* NIC */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200">
                  NIC Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="nic"
                    name="nic"
                    value={formData.nic}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                    placeholder="National ID number"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                </div>
              </div>

              {/* NIC Image */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200">
                  NIC Image
                </label>
                <div className="space-y-4">
                  {formData.nicImage && (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(formData.nicImage)}
                        alt="NIC Preview"
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    id="nicImage"
                    name="nicImage"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    required
                  />
                  {uploading && (
                    <div className="w-full bg-gray-200 rounded h-2">
                      <div
                        className="bg-orange-500 h-2 rounded"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                  {error && <p className="text-red-500">{error}</p>}
                </div>
              </div>

              {/* Profile Picture */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200">
                  Profile Picture (Optional)
                </label>
                <div className="space-y-4">
                  {formData.profilePicture && (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(formData.profilePicture)}
                        alt="Profile Preview"
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    id="profilePicture"
                    name="profilePicture"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                  {uploading && (
                    <div className="w-full bg-gray-200 rounded h-2">
                      <div
                        className="bg-orange-500 h-2 rounded"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                  {error && <p className="text-red-500">{error}</p>}
                </div>
              </div>

              {/* Addresses */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Restaurant Address</h3>
                {formData.addresses.map((address, index) => (
                  <div key={index} className="mb-6 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                        Address {index + 1} {address.isDefault && "(Default)"}
                      </label>
                      <div>
                        {formData.addresses.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAddress(index)}
                            className="text-red-500 hover:text-red-600 mr-2"
                          >
                            Remove
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDefaultAddress(index)}
                          className={`text-orange-500 hover:text-orange-600 ${address.isDefault ? "opacity-50 cursor-not-allowed" : ""}`}
                          disabled={address.isDefault}
                        >
                          Set as Default
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="group">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 group-focus-within:text-orange-500 transition-colors duration-200" htmlFor={`label-${index}`}>
                          Label
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id={`label-${index}`}
                            value={address.label}
                            onChange={(e) => handleAddressChange(index, "label", e.target.value)}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                            placeholder="e.g., Main Branch"
                            required
                          />
                          <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 group-focus-within:text-orange-500 transition-colors duration-200" htmlFor={`street-${index}`}>
                          Street
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id={`street-${index}`}
                            value={address.street}
                            onChange={(e) => handleAddressChange(index, "street", e.target.value)}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                            placeholder="123 Main St"
                            required
                          />
                          <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 group-focus-within:text-orange-500 transition-colors duration-200" htmlFor={`city-${index}`}>
                          City
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id={`city-${index}`}
                            value={address.city}
                            onChange={(e) => handleAddressChange(index, "city", e.target.value)}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                            placeholder="New York"
                            required
                          />
                          <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 group-focus-within:text-orange-500 transition-colors duration-200" htmlFor={`state-${index}`}>
                          State
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id={`state-${index}`}
                            value={address.state}
                            onChange={(e) => handleAddressChange(index, "state", e.target.value)}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                            placeholder="NY"
                            required
                          />
                          <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAddress}
                  className="text-orange-500 hover:text-orange-600 font-medium"
                >
                  + Add Another Address
                </button>
              </div>

              {/* Email */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                    placeholder="you@example.com"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-orange-500 transition-colors duration-200">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                    placeholder="••••••••"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className={`w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white py-4 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center ${
                    uploading || loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600"
                  }`}
                  disabled={uploading || loading}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing up...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">📝</span>
                      Sign Up
                    </>
                  )}
                </button>
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
                  Your account will be reviewed for approval after signup.
                </p>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <a
                  href="#"
                  className="font-medium text-orange-500 hover:text-orange-600 dark:text-orange-400"
                  onClick={() => navigate("/")}
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup