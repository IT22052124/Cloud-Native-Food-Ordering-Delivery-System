// utils/geoUtils.js
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };
  
  export const calculateETA = (distanceKm, avgSpeedKmH = 30) => {
    // avgSpeedKmH: Average delivery speed (30km/h default)
    const hours = distanceKm / avgSpeedKmH;
    const eta = new Date();
    eta.setHours(eta.getHours() + hours);
    return eta;
  };