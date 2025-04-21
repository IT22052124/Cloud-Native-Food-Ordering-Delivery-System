import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getRestaurants } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import RestaurantTable from '../components/RestaurantTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const Resturant = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchRestaurants = async () => {
      try {
        const data = await getRestaurants();
        setRestaurants(Array.isArray(data) ? data : []);
        console.log('Fetched Restaurants:', data);
      } catch (error) {
        toast.error('Failed to fetch restaurants');
        setRestaurants([]);
      }
      setLoading(false);
    };
    fetchRestaurants();
  }, [user, navigate]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 bg-primary-bg dark:dark-bg">
        <Navbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-text-primary dark:dark-text">Owner Dashboard</h2>
          {restaurants.length > 0 ? (
            <RestaurantTable restaurants={restaurants} />
          ) : (
            <p className="text-text-primary dark:dark-text">No restaurants found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resturant;