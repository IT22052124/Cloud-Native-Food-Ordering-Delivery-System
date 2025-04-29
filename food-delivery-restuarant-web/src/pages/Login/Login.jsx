import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { loginOwner } from "../../utils/api";
import { toast } from "react-toastify";
import icon from "../../assets/icon.png"; // Updated to use icon.png

const Landing = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginOwner({ email, password });
      login(response.token, "owner");
      toast.success("Login successful!");
      console.log("Navigating to /dashboard");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 shadow-lg transition-all duration-300">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={icon} alt="FoodDash Icon" className="w-12 h-12 rounded-full object-cover" />
              <span className="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight">FoodDash</span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              {["Features", "How It Works", "Testimonials", "Pricing"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-gray-600 dark:text-gray-300 text-lg font-medium hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200"
                  aria-label={item}
                >
                  {item}
                </a>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <a
                href="/restaurant/admin/login"
                className="text-gray-700 dark:text-gray-300 text-lg font-medium hover:text-orange-500 dark:hover:text-orange-400 px-4 py-2 rounded-lg transition-colors duration-200"
                aria-label="Restaurant Admin Login"
              >
                Restaurant Login
              </a>
              <button
                onClick={() => document.getElementById("login-modal").classList.toggle("hidden")}
                className="text-gray-700 dark:text-gray-300 text-lg font-medium hover:text-orange-500 dark:hover:text-orange-400 px-4 py-2 rounded-lg transition-colors duration-200"
                aria-label="Sign In"
              >
                Sign In
              </button>
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold px-6 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all duration-200"
                onClick={() => navigate("/signup")}
                aria-label="Get Started"
              >
                Get Started
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
      <div id="login-modal" className="fixed inset-0 z-50 flex items-center justify-center hidden transition-opacity duration-300">
        <div
          className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
          onClick={() => document.getElementById("login-modal").classList.add("hidden")}
          aria-hidden="true"
        ></div>
        <div className="w-full max-w-md z-10 mx-4 transform transition-transform duration-300 scale-95">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 relative">
              <button
                onClick={() => document.getElementById("login-modal").classList.add("hidden")}
                className="absolute top-4 right-4 text-white hover:text-orange-100 transition-colors duration-200"
                aria-label="Close Login Modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-3xl font-bold text-white text-center">Welcome Back</h2>
              <p className="text-orange-100 text-center mt-2">Sign in to manage your restaurant</p>
            </div>

            <div className="p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-3" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      placeholder="you@example.com"
                      required
                      aria-required="true"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-3" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      placeholder="••••••••"
                      required
                      aria-required="true"
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
                      aria-label="Remember me"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a
                      href="#"
                      className="font-medium text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200"
                      aria-label="Forgot Password"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 disabled:bg-orange-300 dark:disabled:bg-orange-700"
                  disabled={loading}
                  aria-label={loading ? "Logging in" : "Sign In"}
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
                  <a
                    href="#"
                    className="font-medium text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200"
                    aria-label="Apply to join"
                  >
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
        <section className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-gray-900 dark:to-gray-800 py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-fade-in-up">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
                  Grow Your Restaurant with <span className="text-orange-500">FoodDash</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg">
                  Streamline operations, boost orders, and delight customers with our all-in-one platform designed for restaurant success.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    className="bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold py-3 px-8 rounded-xl shadow-lg transition-all duration-200"
                    onClick={() => navigate("/signup")}
                    aria-label="Join Now"
                  >
                    Join Now
                  </button>
                  <button
                    className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-600 py-3 px-8 rounded-xl text-lg font-semibold transition-all duration-200"
                    onClick={() => (window.location.href = "#how-it-works")}
                    aria-label="Learn More"
                  >
                    Learn More
                  </button>
                </div>
                <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-orange-200 dark:bg-gray-700"
                      ></div>
                    ))}
                  </div>
                  <p className="text-lg font-medium">Trusted by 2,000+ restaurant owners</p>
                </div>
              </div>
              <div className="space-y-8 animate-fade-in-right">
                <div className="relative">
                  <div className="absolute -bottom-8 -left-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl transform rotate-3">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-green-600 dark:text-green-400"
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
                        <p className="text-gray-800 dark:text-white font-semibold text-lg">Order Growth</p>
                        <p className="text-green-600 dark:text-green-400 font-bold text-xl">+32% this month</p>
                      </div>
                    </div>
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
                  Boost your restaurant's growth with <span className="text-orange-500">FoodDash</span>.
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    className="bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold py-3 px-8 rounded-xl shadow-lg transition-all duration-200"
                    onClick={() => navigate("/signup")}
                    aria-label="Get Started"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-32 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Tools for Your Success
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Empower your restaurant with powerful features to streamline operations and grow your business.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Online Ordering",
                  description: "Accept orders from your website, app, and social media with zero commission fees.",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-orange-500"
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
                  description: "Optimize routes, track deliveries in real-time, and keep customers informed.",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-orange-500"
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
                  description: "Streamline kitchen operations with digital tickets and preparation timers.",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-orange-500"
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
                  description: "Build loyalty with automated rewards, offers, and feedback collection.",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-orange-500"
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
                  description: "Update menus in real-time and highlight profitable items.",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-orange-500"
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
                  description: "Gain insights into sales, customers, and staff performance.",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-orange-500"
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
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="mb-6">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-32 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">How FoodDash Works</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Launch your restaurant’s delivery service in minutes with our seamless onboarding process.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {[
                {
                  step: "1",
                  title: "Sign Up",
                  description: "Complete a quick form to connect your restaurant information.",
                },
                {
                  step: "2",
                  title: "Customize",
                  description: "Set up menus, delivery zones, hours, and branding.",
                },
                {
                  step: "3",
                  title: "Go Live",
                  description: "Start accepting orders and growing your business.",
                },
              ].map((item, i) => (
                <div key={i} className="relative flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-orange-500 text-white flex items-center justify-center text-3xl font-bold mb-6 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">{item.description}</p>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-1 bg-orange-200 dark:bg-orange-900"></div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold py-4 px-10 rounded-xl shadow-lg transition-all duration-200"
                onClick={() => navigate("/signup")}
                aria-label="Get Started Now"
              >
                Get Started Now
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 md:py-32 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Loved by Restaurant Owners
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Hear from restaurant owners who transformed their businesses with FoodDash.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  quote: "FoodDash increased our delivery orders by 40% and boosted customer satisfaction.",
                  name: "Sarah Johnson",
                  role: "Owner, Taste of Italy",
                },
                {
                  quote: "Managing everything from my phone is a game-changer. The support team is fantastic!",
                  name: "Michael Chen",
                  role: "Manager, Spice House",
                },
                {
                  quote: "We reduced delivery times by 15 minutes, leading to better reviews and loyal customers.",
                  name: "Alex Rodriguez",
                  role: "Owner, Taco Express",
                },
              ].map((testimonial, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-6 text-orange-500 flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 italic text-lg mb-6 flex-1">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-xl">{testimonial.name}</p>
                      <p className="text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-32 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Choose a plan that fits your restaurant’s needs with no hidden fees or commissions.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  name: "Starter",
                  price: "$49",
                  description: "Ideal for new restaurants starting with delivery.",
                  features: ["Online ordering system", "Menu management", "Up to 100 orders/month", "Email support"],
                  cta: "Get Started",
                  popular: false,
                },
                {
                  name: "Growth",
                  price: "$99",
                  description: "Perfect for expanding your delivery business.",
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
                  description: "For restaurants with multiple locations and complex needs.",
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
                  className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden ${plan.popular ? "ring-4 ring-orange-500 relative" : ""} transform transition-all duration-300 hover:-translate-y-2`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-orange-500 text-white px-6 py-2 text-sm font-semibold rounded-bl-lg">
                      Popular
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{plan.name}</h3>
                    <div className="mb-6">
                      <span className="text-5xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-lg">/month</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">{plan.description}</p>
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-orange-500 shrink-0 mt-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="text-gray-600 dark:text-gray-300 text-lg">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`w-full py-3 px-6 rounded-xl text-lg font-semibold ${plan.popular ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"} shadow-md transition-all duration-200`}
                      onClick={() => navigate(plan.popular ? "/signup" : "/contact")}
                      aria-label={plan.cta}
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
        <section className="py-20 md:py-32 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to Transform Your Restaurant?</h2>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto mb-10">
              Join thousands of restaurants using FoodDash to boost orders and create memorable customer experiences.
            </p>
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-xl border-0 focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-700 text-lg"
                  required
                  aria-required="true"
                  aria-label="Email for Signup"
                />
                <button
                  className="bg-white text-orange-500 hover:bg-orange-50 text-lg font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-200"
                  type="submit"
                  disabled={loading}
                  aria-label={loading ? "Please wait" : "Get Started"}
                >
                  {loading ? "Please wait..." : "Get Started"}
                </button>
              </div>
            </form>
            <p className="text-orange-100 mt-6 text-lg">No credit card required. Start your 14-day free trial today.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img src={icon} alt="FoodDash Icon" className="w-12 h-12 rounded-full object-cover" />
                <span className="text-2xl font-extrabold">FoodDash</span>
              </div>
              <p className="text-gray-400 mb-6 text-lg">
                The ultimate platform for restaurant owners to scale their business.
              </p>
              <div className="flex space-x-6">
                {[
                  { name: "Twitter", icon: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2-3.1.1-5.7-2.4-6.7-5.4.4.1.9.1 1.3.1-2.9-.9-5-3.8-5-7.1 1.3.7 2.8 1.2 4.3 1.2-2.7-1.8-4.5-4.8-4.5-8.4 0-1.8.6-3.5 1.8-4.9 3.3 4.1 8.2 6.7 13.7 7-1.2-5.2 2.7-9.5 7.8-9.5 2.3 0 4.4.9 5.9 2.5 1.8-.4 3.5-1.1 5-2.1-1 3.1-3.7 5.7-7 6.6 1.6-.2 3.1-.6 4.5-1.2-1.1 1.6-2.4 3-3.9 4.1z" },
                  { name: "Facebook", icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                  { name: "Instagram", icon: "M12 2.2c3.2 0 3.6 0 4.9.1 1.3.1 2 .3 2.4.5.6.2 1.1.5 1.6 1s.8 1 1 1.6c.2.4.4 1.1.5 2.4.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.3-.3 2-.5 2.4-.2.6-.5 1.1-1 1.6s-1 .8-1.6 1c-.4.2-1.1.4-2.4.5-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.3-.1-2-.3-2.4-.5-.6-.2-1.1-.5-1.6-1s-.8-1-1-1.6c-.2-.4-.4-1.1-.5-2.4-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.3.3-2 .5-2.4.2-.6.5-1.1 1-1.6s1-.8 1.6-1c.4-.2 1.1-.4πι2.4-.5 1.3-.1 1.7-.1 4.9-.1zm0 1.6c-3.2 0-3.6 0-4.9.1-1.2.1-1.9.3-2.3.5-.5.2-.9.4-1.3.8s-.6.8-.8 1.3c-.2.4-.4 1.1-.5 2.3-.1 1.3-.1 1.7-.1 4.9s0 3.6.1 4.9c.1 1.2.3 1.9.5 2.3.2.5.4.9.8 1.3s.8.6 1.3.8c.4.2 1.1.4 2.3.5 1.3.1 1.7.1 4.9.1s3.6 0 4.9-.1c1.2-.1 1.9-.3 2.3-.5.5-.2.9-.4 1.3-.8s.6-.8.8-1.3c.2-.4.4-1.1.5-2.3.1-1.3.1-1.7.1-4.9s0-3.6-.1-4.9c-.1-1.2-.3-1.9-.5-2.3-.2-.5-.4-.9-.8-1.3s-.8-.6-1.3-.8c-.4-.2-1.1-.4-2.3-.5-1.3-.1-1.7-.1-4.9-.1zm0 3.7a5.6 5.6 0 100 11.2 5.6 5.6 0 000-11.2zm0 9.2a3.6 3.6 0 110-7.2 3.6 3.6 0 010 7.2zm5.8-9.5a1.3 1.3 0 11-2.6 0 1.3 1.3 0 012.6 0z" },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={`#${social.name.toLowerCase()}`}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                    aria-label={social.name}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-6 text-white">Product</h3>
              <ul className="space-y-4">
                {["Features", "Pricing", "Testimonials", "FAQ"].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="text-gray-400 hover:text-white text-lg transition-colors duration-200"
                      aria-label={item}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-6 text-white">Company</h3>
              <ul className="space-y-4">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="text-gray-400 hover:text-white text-lg transition-colors duration-200"
                      aria-label={item}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-6 text-white">Legal</h3>
              <ul className="space-y-4">
                {["Terms", "Privacy", "Cookies"].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="text-gray-400 hover:text-white text-lg transition-colors duration-200"
                      aria-label={item}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p className="text-lg">© {new Date().getFullYear()} FoodDash. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Custom CSS for Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-fade-in-right {
          animation: fadeInRight 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Landing;