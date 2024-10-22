const express = require("express");
const router = express.Router();

const { getAllMovies } = require("../queries/movieQueries")

const {
  verifyTokenFromCookies,
} = require("../middleware/jwt-authorization");

router.get("/", async (req, res) => {
  res.status(200).send("movie route with no token needed!!!");
});

router.get("/get-movies", verifyTokenFromCookies, async (req, res) => {
  const allMovies = await getAllMovies();
  if (allMovies[0]) {
    res.status(200).json(allMovies);
  } else {
    res.status(500).json({ error: "Server Error!" });
  }
});

module.exports = router;