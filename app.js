const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const authRouter = require("./routes/auth");
const movieRouter = require("./routes/movies");
const reset = require("./routes/passwordReset");

// Routes
app.get("/", (req, res) => {
  res.status(200).send("RED CANARY AUTHENTICATION BACKEND!!");
});

app.use("/auth", authRouter, reset);
// app.use("/reset", reset)
app.use("/get-movies", movieRouter);

app.use("*", (err, req, res, next) => {
  res.status(500).send("Something went wrong!");
});


module.exports = app;