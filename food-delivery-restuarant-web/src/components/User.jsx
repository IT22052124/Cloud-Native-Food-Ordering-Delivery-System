import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaUser, FaEdit, FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { getCurrentUser, updateProfile } from '../utils/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserProfile = () => {
  const { token } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  // Fetch user data when token is available
  useEffect(() => {
    if (token) {
      const fetchUserData = async () => {
        try {
          const response = await getCurrentUser(token);
          if (response.success) {
            setUserData(response.user);
            setFormData({
              name: response.user.name || '',
              phone: response.user.phone || '',
            });
            setError('');
          } else {
            setError(response.message || 'Failed to fetch user data');
          }
        } catch (err) {
          setError(err.message || 'Failed to fetch user data');
        }
      };
      fetchUserData();
    }
  }, [token]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await updateProfile(token, formData);
      if (response.success) {
        setUserData(response.user);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        setError(response.message || 'Failed to update profile');
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      toast.error(err.message || 'Failed to update profile');
    }
  };

  // Toggle edit mode
  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setError('');
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="h-24 bg-gradient-to-br from-orange-400 to-pink-500"></div>
          <div className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-gray-700 shadow-md flex items-center justify-center mx-auto -mt-16 border-4 border-white dark:border-gray-800">
              <FaUser className="text-orange-500 dark:text-orange-400 text-3xl" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-gray-100">Authentication Required</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Please log in to view and manage your profile information.
            </p>
            <div className="mt-6">
              <button
                onClick={() => (window.location.href = '/login')}
                className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition duration-200 shadow-md hover:shadow-lg hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Log In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden">
          <div className="h-4 bg-red-500 dark:bg-red-600"></div>
          <div className="p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-500 dark:text-red-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100 mb-4">Error Loading Profile</h2>
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 p-4 rounded-lg text-center">
              {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition duration-200 hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Header Banner */}
        <div className="h-32 bg-gradient-to-br from-orange-400 to-pink-500"></div>

        {/* Profile Content */}
        <div className="relative px-6 pb-8 sm:px-8">
          {/* Back Button */}
          <div className="absolute top-6 left-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg transition duration-200 shadow-md hover:scale-105"
            >
              <FaArrowLeft className="text-lg" />
              <span>Back</span>
            </button>
          </div>

          {/* Profile Header */}
          <div className="flex flex-col items-center -mt-16 mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-orange-100 dark:bg-gray-700 shadow-lg flex items-center justify-center overflow-hidden relative">
              {userData.profilePicture ? (
                <>
                  <img
                    src={userData.profilePicture}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <FaUser className="absolute text-orange-500 dark:text-orange-400 text-4xl opacity-50" />
                </>
              ) : (
                <FaUser className="text-orange-500 dark:text-orange-400 text-4xl" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-4">
              {isEditing ? 'Edit Profile' : userData.name}
            </h1>
            <span className="mt-1 px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full dark:bg-orange-900/30 dark:text-orange-300">
              Restaurant
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Edit Form or Profile Info */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FaUser />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={toggleEdit}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200 shadow-md hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition duration-200 shadow-md hover:scale-105"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Name */}
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-2">
                    <FaUser className="text-orange-500 dark:text-orange-400" />
                    <span className="text-sm font-medium">Name</span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-100 font-medium">
                    {userData.name || 'Not provided'}
                  </p>
                </div>

                {/* Email */}
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-orange-500 dark:text-orange-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-100 font-medium">
                    {userData.email || 'Not provided'}
                  </p>
                </div>

                {/* Phone */}
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-orange-500 dark:text-orange-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span className="text-sm font-medium">Phone</span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-100 font-medium">
                    {userData.phone || 'Not provided'}
                  </p>
                </div>

                {/* Address */}
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-orange-500 dark:text-orange-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium">Address</span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-100 font-medium">
                    {userData.address
                      ? typeof userData.address === 'string'
                        ? userData.address
                        : `${userData.address.street}, ${userData.address.city}, ${userData.address.province} ${userData.address.postalCode}`
                      : 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Edit Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={toggleEdit}
                  className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200 shadow-md hover:scale-105"
                >
                  <FaEdit className="text-lg" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;