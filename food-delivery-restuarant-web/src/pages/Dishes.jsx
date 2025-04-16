import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getDishes, deleteDish } from '../utils/api';
import DishTable from '../components/DishTable';
import DishSidebar from '../components/DishSidebar';
import Navbar from '../components/Navbar';
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
        toast.error('Failed to fetch dishes');
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
    <div className="flex min-h-screen">
      <DishSidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 dark:text-black">Manage Dishes</h2>
        
          <DishTable dishes={dishes}  />
        </div>
      </div>
    </div>
  );
};

export default Dishes;