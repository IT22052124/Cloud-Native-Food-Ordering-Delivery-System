import React from 'react';
import Lottie from 'lottie-react';
import loaderAnimation from '../assets/loader.json';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center  bg-gray-900 h-screen ">
      <Lottie
        animationData={loaderAnimation}
        loop={true}
        autoplay={true}
        style={{ width: 500, height: 500 }}
      />
    </div>
  );
};

export default LoadingSpinner;