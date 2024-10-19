const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const authRouter = require("./routes/auth");
const movieRouter = require("./routes/movies");

// Routes
app.get("/", (req, res) => {
  res.status(200).send("RED CANARY AUTHENTICATION BACKEND!!");
});

app.use("/auth", authRouter);
app.use("/get-movies", movieRouter);

app.use("*", (err, req, res, next) => {
  res.status(500).send("Something went wrong!");
});


module.exports = app;