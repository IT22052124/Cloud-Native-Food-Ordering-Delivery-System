import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DishTable = ({ dishes, onDelete }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch = dish.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' || (filter === 'available' && dish.isAvailable) || (filter === 'unavailable' && !dish.isAvailable);
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="mb-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
        <input
          type="text"
          placeholder="Search dishes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg dark:bg-gray-800">
          <thead className="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Availability</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDishes.map((dish) => (
              <tr key={dish._id} className="border-b dark:border-gray-600">
                <td className="p-3">{dish.name}</td>
                <td className="p-3">LKR {dish.price.toFixed(2)}</td>
                <td className="p-3">{dish.isAvailable ? 'Available' : 'Unavailable'}</td>
                <td className="p-3 flex space-x-2">
                  <Link to={`/dishes/edit/${dish._id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                    Edit
                  </Link>
                  <button
                    onClick={() => onDelete(dish._id)}
                    className="text-red-600 hover:underline dark:text-red-400"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DishTable;