"use client"

import { useNavigate } from "react-router-dom"

const SignupConfirmation = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 dark:bg-gray-900">
      <div className="w-full max-w-3xl mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-orange-500 p-6">
            <h2 className="text-2xl font-bold text-white text-center">FoodDash Registration</h2>
            <p className="text-orange-100 text-center mt-1">Thank You for Signing Up!</p>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <div className="space-y-6">
              <div className="flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-orange-500 dark:text-orange-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Registration Submitted
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your registration has been successfully sent for verification. The FoodDash
                organization may contact you after the verification process is complete.
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                You will be notified once your account is approved. Thank you for joining FoodDash!
              </p>
              <div className="pt-4">
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600"
                >
                  <span className="mr-2">🔑</span>
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupConfirmation