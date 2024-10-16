const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/db");
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const crypto = require("crypto");
const redisClient = require("redis").createClient();


const {
  verifyToken,
} = require("../middleware/jwt-authorization");
const { apiLimiter} = require("../middleware/rateLimiter")

router.get( "/", verifyToken, async (req, res) => {
      res.status(200).send("movie route");
})

module.exports = router;