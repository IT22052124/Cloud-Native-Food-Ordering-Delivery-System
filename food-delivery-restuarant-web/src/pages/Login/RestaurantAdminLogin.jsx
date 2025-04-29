"use client"

import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { loginRestaurantAdmin } from "../../utils/api"
import { toast } from "react-toastify"
import {
  UserIcon,
  LockIcon,
  ChevronRightIcon,
  StarIcon,
  BarChartIcon,
  MenuIcon,
  TruckIcon,
  HeartIcon,
  PhoneIcon,
  XIcon,
  MailIcon,
  StoreIcon,
} from "lucide-react"

const Landing = () => {
  // Keep all the original state and functions intact
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Signup form state (no longer needed, but keeping for reference)
  const [restaurantName, setRestaurantName] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [signupLoading, setSignupLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await loginRestaurantAdmin({ username, password })
      login(response.token, "admin")
      toast.success("Login successful!")
      navigate("/dishes")
    } catch (error) {
      toast.error(error.response?.data?.message)
    }
    setLoading(false)
  }

  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    setSignupLoading(true)
    try {
      // This would be replaced with your actual signup API call
      toast.success("Signup request received! We'll contact you shortly.")
      // Reset form
      setRestaurantName("")
      setOwnerName("")
      setEmail("")
      setPhone("")
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    }
    setSignupLoading(false)
  }

  const toggleLoginModal = () => {
    setShowLoginModal(!showLoginModal)
  }

  return (
    <div className="min-h-screen w-full bg-gray-900">
      {/* Header */}
      <header className="w-full py-4 px-8 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center">
          <div className="text-white font-bold text-xl">
            <span className="text-cyan-400">FOOD</span>
            <span>DASH</span>
          </div>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-300 hover:text-white text-sm">
            Features
          </a>
          <a href="#how-it-works" className="text-gray-300 hover:text-white text-sm">
            How It Works
          </a>
          <a href="#pricing" className="text-gray-300 hover:text-white text-sm">
            Pricing
          </a>
          <a href="#testimonials" className="text-gray-300 hover:text-white text-sm">
            Testimonials
          </a>
        </nav>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleLoginModal}
            className="text-white bg-transparent border border-gray-700 px-4 py-2 rounded-md hover:bg-gray-800 text-sm transition-colors duration-200"
          >
            Login
          </button>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-70" onClick={toggleLoginModal}></div>
          <div className="bg-gray-900 w-full max-w-md p-8 rounded-lg z-10 border border-gray-800 transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Restaurant Admin Login</h2>
              <button onClick={toggleLoginModal} className="text-gray-400 hover:text-white">
                <XIcon size={20} />
              </button>
            </div>

            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-full border-2 border-cyan-400 flex items-center justify-center transition-transform duration-300 hover:scale-105">
                <UserIcon size={32} className="text-cyan-400" />
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4 relative">
                <div className="flex items-center bg-gray-800 rounded-md px-3 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-cyan-400">
                  <UserIcon size={16} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 bg-transparent border-none focus:outline-none text-white placeholder-gray-500"
                    placeholder="USERNAME"
                    required
                  />
                </div>
              </div>

              <div className="mb-6 relative">
                <div className="flex items-center bg-gray-800 rounded-md px-3 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-cyan-400">
                  <LockIcon size={16} className="text-gray-400 mr-2" />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 bg-transparent border-none focus:outline-none text-white placeholder-gray-500"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white p-2 rounded-md hover:from-pink-600 hover:to-pink-700 disabled:opacity-70 font-medium transition-all duration-200 hover:shadow-lg"
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
                    className="mr-2 accent-cyan-400"
                  />
                  <label htmlFor="rememberMe">Remember me</label>
                </div>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-200">
                  Forgot your password?
                </a>
              </div>
            </form>

            <div className="mt-6 text-center text-gray-400 text-xs">
              Need help? Contact our hotline: <span className="text-cyan-400 font-bold">11235837</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="w-full min-h-[80vh] flex overflow-hidden">
        {/* Left side - Content */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <div className="max-w-lg mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Grow Your Restaurant Business with <span className="text-cyan-400">FOOD</span>DASH
            </h1>
            <p className="text-gray-300 mb-8">
              The all-in-one platform that helps restaurant owners increase orders, streamline operations, and delight
              customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => document.getElementById("how-it-works").scrollIntoView({ behavior: "smooth" })}
                className="bg-transparent border border-gray-700 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors duration-200"
              >
                Learn More
              </button>
            </div>
            <div className="mt-8 text-sm text-gray-400">
              Need help? Contact our hotline: <span className="text-cyan-400 font-bold">11235837</span>
            </div>
          </div>
        </div>

        {/* Right side - Enhanced Sign-in Form */}
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
            <div className="bg-gray-900 w-full max-w-md p-8 rounded-lg border border-gray-800 mx-auto shadow-xl transform transition-all duration-300 hover:shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 text-center">Restaurant Admin Login</h2>

              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 rounded-full border-2 border-cyan-400 flex items-center justify-center transition-transform duration-300 hover:scale-105">
                  <UserIcon size={32} className="text-cyan-400" />
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4 relative">
                  <div className="flex items-center bg-gray-800 rounded-md px-3 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-cyan-400">
                    <UserIcon size={16} className="text-gray-400 mr-2" />
                    <input
                      type="text"
                      id="hero-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full p-2 bg-transparent border-none focus:outline-none text-white placeholder-gray-500"
                      placeholder="USERNAME"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6 relative">
                  <div className="flex items-center bg-gray-800 rounded-md px-3 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-cyan-400">
                    <LockIcon size={16} className="text-gray-400 mr-2" />
                    <input
                      type="password"
                      id="hero-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2 bg-transparent border-none focus:outline-none text-white placeholder-gray-500"
                      placeholder="••••••••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white p-2 rounded-md hover:from-pink-600 hover:to-pink-700 disabled:opacity-70 font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                  disabled={loading}
                >
                  {loading ? "LOGGING IN..." : "LOGIN"}
                </button>

                <div className="flex justify-between mt-4 text-xs text-gray-400">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hero-rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="mr-2 accent-cyan-400"
                    />
                    <label htmlFor="hero-rememberMe">Remember me</label>
                  </div>
                  <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-200">
                    Forgot your password?
                  </a>
                </div>
              </form>

              <div className="mt-6 text-center text-gray-400 text-xs">
                Need help? Contact our hotline: <span className="text-cyan-400 font-bold">11235837</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Powerful Features for Restaurants</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Our platform gives restaurant owners everything they need to succeed in the digital food delivery space.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Online Ordering",
                description: "Accept orders directly from your website and mobile app with zero commission fees.",
                icon: <MenuIcon className="text-cyan-400" size={32} />,
              },
              {
                title: "Delivery Management",
                description: "Track deliveries in real-time and keep customers informed automatically.",
                icon: <TruckIcon className="text-cyan-400" size={32} />,
              },
              {
                title: "Menu Management",
                description: "Update your menu in real-time and highlight your most profitable items.",
                icon: <MenuIcon className="text-cyan-400" size={32} />,
              },
              {
                title: "Customer Loyalty",
                description: "Keep customers coming back with automated rewards and personalized offers.",
                icon: <HeartIcon className="text-cyan-400" size={32} />,
              },
              {
                title: "Real-time Analytics",
                description: "Get insights into sales, customer behavior, and staff performance.",
                icon: <BarChartIcon className="text-cyan-400" size={32} />,
              },
              {
                title: "24/7 Support",
                description: "Our dedicated team is always available to help you succeed.",
                icon: <PhoneIcon className="text-cyan-400" size={32} />,
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-cyan-400 transition-colors duration-200"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How FoodDash Works</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
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
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>

                {i < 2 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gray-700"></div>}
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <a href="#" className="text-cyan-400 hover:text-cyan-300 underline transition-colors duration-200">
              Learn more about our onboarding process
            </a>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
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
                cta: "Contact Sales",
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
                cta: "Contact Sales",
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
                className={`bg-gray-800 rounded-lg overflow-hidden border ${
                  plan.popular ? "border-cyan-400" : "border-gray-700"
                }`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-1 text-sm font-medium text-center">
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <p className="text-gray-300 mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <ChevronRightIcon className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-2 px-4 rounded-md ${
                      plan.popular
                        ? "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                        : "bg-gray-700 text-white hover:bg-gray-600"
                    } transition-colors duration-200`}
                    onClick={() => navigate("/contact")}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Loved by Restaurant Owners</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
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
              <div key={i} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex flex-col h-full">
                  <div className="mb-4 text-cyan-400 flex">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5" fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-gray-300 italic mb-6 flex-1">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-bold text-white">{testimonial.name}</p>
                    <p className="text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-900 to-pink-900">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to grow your restaurant business?</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Join thousands of successful restaurants using FoodDash to increase orders and delight customers.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={toggleLoginModal}
              className="bg-transparent border border-white text-white px-6 py-3 rounded-md hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
            >
              Login
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-md hover:from-pink-600 hover:to-pink-700 font-medium transition-all duration-200 hover:shadow-lg"
            >
              Sign Up Now
            </button>
          </div>
          <div className="mt-8 text-sm text-gray-400">
            Need help? Contact our hotline: <span className="text-cyan-400 font-bold">11235837</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="text-white font-bold text-xl">
                  <span className="text-cyan-400">FOOD</span>
                  <span>DASH</span>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                The all-in-one platform for restaurant owners to grow their business.
              </p>
              <div className="flex space-x-4">
                {["twitter", "facebook", "instagram"].map((social) => (
                  <a key={social} href={`#${social}`} className="text-gray-400 hover:text-white">
                    <span className="sr-only">{social}</span>
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-gray-600 rounded-sm"></div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg text-white mb-4">Product</h3>
              <ul className="space-y-2">
                {["Features", "Pricing", "Testimonials", "FAQ"].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase()}`} className="text-gray-400 hover:text-cyan-400">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg text-white mb-4">Company</h3>
              <ul className="space-y-2">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase()}`} className="text-gray-400 hover:text-cyan-400">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg text-white mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-cyan-400">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-cyan-400">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-cyan-400">
                    Status
                  </a>
                </li>
                <li className="flex items-center">
                  <PhoneIcon size={16} className="text-cyan-400 mr-2" />
                  <span className="text-gray-400">
                    Hotline: <span className="text-cyan-400 font-bold">11235837</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} FoodDash. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing