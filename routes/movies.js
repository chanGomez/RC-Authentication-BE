const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/db");
const router = express.Router();


const {
  verifyToken,
} = require("../middleware/jwt-authorization");

router.get( "/", verifyToken,  async (req, res) => {
      res.status(200).send("movie route! can only be reached with valid token!");
})
router.get("/no-token", async (req, res) => {
  res.status(200).send("movie route with no token needed!!!");
});

module.exports = router;