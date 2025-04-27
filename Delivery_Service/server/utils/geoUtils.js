// utils/googleMaps.js
const axios = require('axios');

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Get distances using Google Distance Matrix API
 * @param {string} origins - e.g. "lat,lng"
 * @param {string} destinations - e.g. "lat1,lng1|lat2,lng2"
 */
const getDistanceMatrix = async (origins, destinations) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: {
        origins,
        destinations,
        key: GOOGLE_API_KEY,
        mode: 'driving',
      },
    });

    if (response.data.status !== 'OK') {
      throw new Error('Distance Matrix API error: ' + response.data.status);
    }

    return response.data;
  } catch (error) {
    console.error('Google Distance Matrix error:', error.message);
    throw error;
  }
};

/**
 * Get route polyline and ETA using Directions API
 * @param {string} origin - "lat,lng"
 * @param {string} destination - "lat,lng"
 */
const getRouteAndETA = async (origin, destination) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin,
        destination,
        key: GOOGLE_API_KEY,
        mode: 'driving',
      },
    });

    if (response.data.status !== 'OK') {
      throw new Error('Directions API error: ' + response.data.status);
    }

    const route = response.data.routes[0];
    const polylinePoints = decodePolyline(route.overview_polyline.points);
    const eta = new Date(Date.now() + route.legs[0].duration.value * 1000);

    return {
      route: polylinePoints,
      eta,
    };
  } catch (error) {
    console.error('Google Directions API error:', error.message);
    throw error;
  }
};

/**
 * Decode Google Encoded Polyline string
 * @param {string} encoded
 * @returns {Array<[number, number]>} - [[lng, lat], [lng, lat], ...]
 */
function decodePolyline(encoded) {
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0, coordinates = [];

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    coordinates.push([lng / 1e5, lat / 1e5]);
  }

  return coordinates;
}

module.exports = {
  getDistanceMatrix,
  getRouteAndETA,
  decodePolyline,
};
