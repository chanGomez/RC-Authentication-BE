const express = require("express");
const router = express.Router();


const {
  verifyTokenFromCookies,
} = require("../middleware/jwt-authorization");

router.get("/", async (req, res) => {
  res.status(200).send("movie route with no token needed!!!");
});
router.get("/cookie-token", verifyTokenFromCookies,  async (req, res) => {
  res.status(200).send("Token verified through cookies!!");
});
router.get("/get-movies", verifyTokenFromCookies, async (req, res) => {
  res.status(200).send("Movie route only seen with token verified through cookies!!");
});

module.exports = router;