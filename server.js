const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json()); // Add this if you handle JSON requests

const authRouter = require("./routes/auth");

// Routes
app.get("/", (req, res) => {
  res.status(200).send("RED CANARY AUTHENTICATION BACKEND!!");
});

app.use("/auth", authRouter);


app.use("*", (err, req, res, next) => {
  res.status(500).send("Something went wrong!");
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
