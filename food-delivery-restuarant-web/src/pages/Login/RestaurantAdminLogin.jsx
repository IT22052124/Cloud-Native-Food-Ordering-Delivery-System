"use client"

import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { loginRestaurantAdmin } from "../../utils/api"
import { toast } from "react-toastify"
import { UserIcon, LockIcon } from "lucide-react"

const RestaurantAdminLogin = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await loginRestaurantAdmin({ username, password })
      login(response.token,"admin")
      toast.success("Login successful!")
      navigate("/dishes")
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen w-full bg-gray-900">
      <div className="min-h-screen w-full flex overflow-hidden">
        {/* Left side - Login Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col">
          <div className="mb-8">
            <div className="flex items-center">
              <div className="text-white font-bold text-xl">
                <span className="text-cyan-400">FOOD</span>
                <span>DASH</span>
              </div>
            </div>
          </div>

          <div className="flex-grow flex flex-col justify-center items-center">
            <div className="w-full max-w-md">
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 rounded-full border-2 border-cyan-400 flex items-center justify-center">
                  <UserIcon size={40} className="text-cyan-400" />
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4 relative">
                  <div className="flex items-center bg-gray-800 rounded-md px-3">
                    <UserIcon size={16} className="text-gray-400 mr-2" />
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full p-2 bg-transparent border-none focus:outline-none text-white"
                      placeholder="USERNAME"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6 relative">
                  <div className="flex items-center bg-gray-800 rounded-md px-3">
                    <LockIcon size={16} className="text-gray-400 mr-2" />
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2 bg-transparent border-none focus:outline-none text-white"
                      placeholder="••••••••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white p-2 rounded-md hover:from-pink-600 hover:to-pink-700 disabled:opacity-70 font-medium"
                  disabled={loading}
                >
                  {loading ? "LOGGING IN..." : "LOGIN"}
                </button>

                <div className="flex justify-between mt-4 text-xs text-gray-400">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="rememberMe">Remember me</label>
                  </div>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Forgot your password?
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right side - Welcome Message */}
        <div className="hidden md:block md:w-1/2 relative">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full">
              <svg
                viewBox="0 0 500 500"
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
                preserveAspectRatio="none"
              >
                <path
                  d="M156.4,339.5c31.8-2.5,59.4-26.8,80.2-48.5c28.3-29.5,40.5-47,56.1-85.1c14-34.3,20.7-75.6,2.3-111  c-18.1-34.8-55.7-58-90.4-72.3c-11.7-4.8-24.1-8.8-36.8-11.5l-0.9-0.9l-0.6,0.6c-27.7-5.8-56.6-6-82.4,3c-38.8,13.6-64,48.8-66.8,90.3c-3,43.9,17.8,88.3,33.7,128.8c5.3,13.5,10.4,27.1,14.9,40.9C77.5,309.9,111,343,156.4,339.5z"
                  fill="#6b21a8"
                  opacity="0.4"
                  transform="translate(100 100)"
                />
              </svg>
            </div>
          </div>

          <div className="relative z-10 flex flex-col justify-center h-full px-12">
            <h1 className="text-5xl font-bold text-white mb-4">Welcome.</h1>
            <p className="text-gray-300 mb-8 text-sm">
              Access your FoodDash restaurant admin dashboard to manage your menu, track orders, and grow your business.
            </p>
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-2">About FoodDash</h3>
              <p className="text-gray-300 text-sm">
                FoodDash is the premier food delivery platform connecting restaurants with hungry customers. Our admin
                dashboard gives you complete control over your restaurant's digital presence, menu management, and order
                fulfillment.
              </p>
            </div>
            <div className="text-sm text-gray-300">
              Not a member?{" "}
              <a href="#" className="text-white underline">
                Sign up now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RestaurantAdminLogin
