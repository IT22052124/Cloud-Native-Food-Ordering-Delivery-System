import express from "express";
import cors from "cors";
import BodyParser from "body-parser";
import mongoose from "mongoose";
import config from "./config.js";

const app = express();

app.use(
  cors({
    origin: config.frontendUrl,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());
app.use(BodyParser.json());
app.use(express.urlencoded({ extended: false }));

const PORT = config.port || 4000;
mongoose
  .connect(config.MongoDB_URI)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT} 🔥`)
    );
  })
  .catch((err) => console.log(err));
