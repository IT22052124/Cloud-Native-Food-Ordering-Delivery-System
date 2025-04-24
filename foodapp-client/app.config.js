import "dotenv/config";

export default ({ config }) => {
  return {
    ...config,
    extra: {
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    },
  };
};
