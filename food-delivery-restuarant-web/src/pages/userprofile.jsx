import React, { useState, useEffect, useContext } from 'react';

import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import UserProfile from '../components/User';


const user = () => {

  

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 bg-gray-900 dark:dark-bg">
        <Navbar />
        <div className="p-6">
            <UserProfile />
        
        </div>
      </div>
    </div>
  );
};

export default user;