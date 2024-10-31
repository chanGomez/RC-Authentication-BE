const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");

app.use(cookieParser());
require("dotenv").config();
app.use(cors());
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