"use client"

import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { loginOwner } from "../../utils/api"
import { toast } from "react-toastify"

const Landing = () => {
  // Keep all the original state and functions intact
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await loginOwner({ email, password })
      login(response.token, "owner")
      toast.success("Login successful!")
      console.log("Navigating to /dashboard")
      navigate("/dashboard")
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed")
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-800 dark:text-white">FoodDash</span>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <a
                href="#features"
                className="text-gray-600 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400"
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                className="text-gray-600 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400"
              >
                Testimonials
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400"
              >
                Pricing
              </a>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => document.getElementById("login-modal").classList.toggle("hidden")}
                className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 px-4 py-2 rounded-md"
              >
                Sign In
              </button>

              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center"
                onClick={() => navigate("/signup")}
              >
                Get Started
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <div id="login-modal" className="fixed inset-0 z-50 flex items-center justify-center hidden">
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => document.getElementById("login-modal").classList.add("hidden")}
        ></div>
        <div className="w-full max-w-md z-10 mx-4">
          {/* Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-orange-500 p-6 relative">
              <button
                onClick={() => document.getElementById("login-modal").classList.add("hidden")}
                className="absolute top-4 right-4 text-white hover:text-orange-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-white text-center">Welcome Back</h2>
              <p className="text-orange-100 text-center mt-1">Sign in to manage your restaurant</p>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="email">
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="password">
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-orange-500 hover:text-orange-600 dark:text-orange-400">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200 disabled:bg-orange-300 dark:disabled:bg-orange-700"
                  disabled={loading}
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
                      Logging in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <a href="#" className="font-medium text-orange-500 hover:text-orange-600 dark:text-orange-400">
                    Apply to join
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  Grow Your Restaurant Business with <span className="text-orange-500">FoodDash</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  The all-in-one platform that helps restaurant owners increase orders, streamline operations, and
                  delight customers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg text-lg"
                    onClick={() => navigate("/signup")}
                  >
                    Join Now
                  </button>
                  <button
                    className="border border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-800 py-3 px-6 rounded-lg text-lg"
                    onClick={() => (window.location.href = "#how-it-works")}
                  >
                    Learn More
                  </button>
                </div>
                <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-orange-200 dark:bg-gray-700"
                      ></div>
                    ))}
                  </div>
                  <p>Trusted by 2,000+ restaurant owners</p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src="https://placehold.co/800x500/orange/white"
                    alt="FoodDash Restaurant Dashboard"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-600 dark:text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-800 dark:text-white font-medium">Order Growth</p>
                      <p className="text-green-600 dark:text-green-400 font-bold">+32% this month</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Everything you need to succeed
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our platform gives restaurant owners powerful tools to grow their business and provide exceptional
                service.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Online Ordering",
                  description:
                    "Accept orders directly from your website, mobile app, and social media with zero commission fees.",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-orange-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Delivery Management",
                  description:
                    "Optimize routes, track deliveries in real-time, and keep customers informed automatically.",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-orange-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Kitchen Display",
                  description:
                    "Streamline your kitchen operations with digital ticket management and preparation timers.",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-orange-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Customer Loyalty",
                  description:
                    "Keep customers coming back with automated rewards, personalized offers, and feedback collection.",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-orange-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Menu Management",
                  description:
                    "Update your menu in real-time, add seasonal specials, and highlight your most profitable items.",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-orange-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Analytics Dashboard",
                  description:
                    "Get insights into sales, customer behavior, and staff performance to make data-driven decisions.",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-orange-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  ),
                },
              ].map((feature, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">How FoodDash Works</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Get up and running in minutes with our simple onboarding process.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: "1",
                  title: "Sign Up",
                  description: "Complete our simple application form and connect your restaurant information.",
                },
                {
                  step: "2",
                  title: "Customize",
                  description: "Set up your menu, delivery zones, business hours, and branding.",
                },
                {
                  step: "3",
                  title: "Go Live",
                  description: "Start accepting orders and growing your restaurant business.",
                },
              ].map((item, i) => (
                <div key={i} className="relative flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{item.description}</p>

                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-orange-200 dark:bg-orange-900"></div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-8 rounded-lg text-lg"
                onClick={() => navigate("/signup")}
              >
                Get Started Now
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 md:py-24 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Loved by Restaurant Owners
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Don't just take our word for it. Here's what our customers have to say.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    "Since joining FoodDash, our delivery orders have increased by 40% and our customer satisfaction has never been higher.",
                  name: "Sarah Johnson",
                  role: "Owner, Taste of Italy",
                },
                {
                  quote:
                    "The platform is so easy to use. I can manage everything from my phone, and the customer support team is always there when I need them.",
                  name: "Michael Chen",
                  role: "Manager, Spice House",
                },
                {
                  quote:
                    "We've been able to reduce our delivery times by 15 minutes on average, leading to better reviews and more repeat customers.",
                  name: "Alex Rodriguez",
                  role: "Owner, Taco Express",
                },
              ].map((testimonial, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex flex-col h-full">
                    <div className="mb-4 text-orange-500 flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 italic mb-6 flex-1">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{testimonial.name}</p>
                      <p className="text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                No hidden fees or commissions. Just straightforward pricing to help your business grow.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  name: "Starter",
                  price: "$49",
                  description: "Perfect for new restaurants just getting started with delivery.",
                  features: ["Online ordering system", "Menu management", "Up to 100 orders/month", "Email support"],
                  cta: "Get Started",
                  popular: false,
                },
                {
                  name: "Growth",
                  price: "$99",
                  description: "For established restaurants looking to expand their delivery business.",
                  features: [
                    "Everything in Starter",
                    "Unlimited orders",
                    "Customer loyalty program",
                    "Analytics dashboard",
                    "Priority support",
                  ],
                  cta: "Get Started",
                  popular: true,
                },
                {
                  name: "Enterprise",
                  price: "$199",
                  description: "For restaurants with multiple locations and complex operations.",
                  features: [
                    "Everything in Growth",
                    "Multiple locations",
                    "Custom integrations",
                    "Dedicated account manager",
                    "Staff management",
                  ],
                  cta: "Contact Sales",
                  popular: false,
                },
              ].map((plan, i) => (
                <div
                  key={i}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${plan.popular ? "ring-2 ring-orange-500 relative" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1 text-sm font-medium">
                      Popular
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                      <span className="text-gray-500 dark:text-gray-400">/month</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{plan.description}</p>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-orange-500 shrink-0 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`w-full py-2 px-4 rounded-lg ${plan.popular ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"}`}
                      onClick={() => navigate(plan.popular ? "/signup" : "/contact")}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-orange-500">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to grow your restaurant business?</h2>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto mb-8">
              Join thousands of successful restaurants using FoodDash to increase orders and delight customers.
            </p>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white"
                  required
                />
                <button
                  className="bg-white text-orange-500 hover:bg-orange-50 px-4 py-3 rounded-lg"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Please wait..." : "Get Started"}
                </button>
              </div>
            </form>
            <p className="text-orange-100 mt-4 text-sm">No credit card required. Start your 14-day free trial today.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-xl font-bold">FoodDash</span>
              </div>
              <p className="text-gray-400 mb-4">
                The all-in-one platform for restaurant owners to grow their business.
              </p>
              <div className="flex space-x-4">
                {["twitter", "facebook", "instagram"].map((social) => (
                  <a key={social} href={`#${social}`} className="text-gray-400 hover:text-white">
                    <span className="sr-only">{social}</span>
                    <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Product</h3>
              <ul className="space-y-2">
                {["Features", "Pricing", "Testimonials", "FAQ"].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase()}`} className="text-gray-400 hover:text-white">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase()}`} className="text-gray-400 hover:text-white">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                {["Terms", "Privacy", "Cookies"].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase()}`} className="text-gray-400 hover:text-white">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} FoodDash. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing

