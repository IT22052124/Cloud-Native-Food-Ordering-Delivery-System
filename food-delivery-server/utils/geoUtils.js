const axios = require('axios');

// Configuration
const OPENROUTE_API_KEY = process.env.OPENROUTE_API_KEY || 'your_api_key_here'; // Remove hardcoding in production

/**
 * Calculate haversine distance manually (in KM)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth (km)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const deg2rad = (deg) => (deg * Math.PI) / 180;

/**
 * Get Distance Matrix (driving distance & time)
 */
if (!OPENROUTE_API_KEY) {
  throw new Error('Missing OpenRouteService API key in environment variables');
}

const getDistanceMatrix = async (origin, destination) => {
  try {
    const response = await axios.post(
      'https://api.openrouteservice.org/v2/matrix/driving-car',
      {
        locations: [
          [parseFloat(origin.split(',')[1]), parseFloat(origin.split(',')[0])], // [lng, lat]
          [parseFloat(destination.split(',')[1]), parseFloat(destination.split(',')[0])]
        ],
        metrics: ['distance', 'duration'],
        units: 'm'
      },
      {
        headers: {
          'Authorization': OPENROUTE_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      distanceMeters: response.data.distances[0][1],
      durationSeconds: response.data.durations[0][1]
    };
  } catch (error) {
    console.error('OpenRouteService Matrix Error:', error.response?.data || error.message);
    throw new Error('Failed to get distance matrix');
  }
};

const getRoutePolyline = async (origin, destination) => {
  try {
    const response = await axios.get(
      'https://api.openrouteservice.org/v2/directions/driving-car',
      {
        params: {
          start: `${origin.split(',')[1]},${origin.split(',')[0]}`, // lng,lat
          end: `${destination.split(',')[1]},${destination.split(',')[0]}`
        },
        headers: {
          'Authorization': OPENROUTE_API_KEY
        }
      }
    );

    return response.data.features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  } catch (error) {
    console.error('OpenRouteService Directions Error:', error.response?.data || error.message);
    throw new Error('Failed to get route polyline');
  }
};

module.exports = {
  calculateDistance,
  getDistanceMatrix,
  getRoutePolyline
};