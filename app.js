const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
require("dotenv").config();
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173"];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200, // For legacy browser support
};
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());

const authRouter = require("./controllers/authController");
const movieRouter = require("./controllers/movies");
const resetRouter = require("./controllers/passwordController");

// Routes
app.get("/", (req, res) => {
  res.status(200).send("RED CANARY AUTHENTICATION BACKEND!!");
});

app.use("/auth", authRouter);
app.use("/reset", resetRouter);
app.use("/movies", movieRouter);

app.use("*", (err, req, res, next) => {
  res.status(500).send("Something went wrong!");
});

module.exports = app;
