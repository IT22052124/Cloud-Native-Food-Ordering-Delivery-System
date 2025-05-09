import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getDishes, deleteDish } from '../utils/api';
import DishTable from '../components/DishTable';
import DishSidebar from '../components/DishSidebar';
import Navbar from '../components/DishNavBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const Dishes = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
   
    const fetchDishes = async () => {
      try {
        const data = await getDishes(user.restaurantId);
        setDishes(data.dishes);
      } catch (error) {
        console.error('Failed to fetch dishes');
      }
      setLoading(false);
    };
    fetchDishes();
  }, [user, navigate]);

 
  const handleDelete = (id) => {
    setDishes((prevDishes) => prevDishes.filter((dish) => dish._id !== id));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen bg-gray dark:bg-gray-900">
      <DishSidebar />
      <div className="flex-1 ml-64 bg-gray  ">
        <Navbar />
        <div className="p-6 bg-gray -50 dark:bg-gray-900">

        
          <DishTable dishes={dishes}  />
        </div>
      </div>
    </div>
  );
};

export default Dishes;