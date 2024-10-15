const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/db"); // Import the PostgreSQL db from db.js
const router = express.Router();

//middleware
const { authenticateToken } = require("../middleware/jwt-authorization");
const { validatePassword, validateEmail, validateUsername } = require("../middleware/validate");


// Registration route
router.post("/register", validatePassword, validateEmail, validateUsername, async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const userExistsQuery = "SELECT * FROM users WHERE username = $1 OR email = $2";
    const userExists = await db.query(userExistsQuery, [username, email]);

    if (userExists.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertUserQuery =
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)";
    await db.query(insertUserQuery, [username, email, hashedPassword]);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Server error during registration",
      error: error.message,
    });
  }
});

  module.exports = router;