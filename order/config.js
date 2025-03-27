import dotenv from "dotenv";
import assert from "assert";
dotenv.config();

const { PORT, HOST, HOST_URL, MongoDB_URI } = process.env;

assert(PORT, "Port is required");
assert(HOST, "Host is required");

export default {
  port: PORT,
  host: HOST,
  hostUrl: HOST_URL,
  MongoDB_URI: MongoDB_URI,
  frontendUrl: "http://localhost:3000",
};
