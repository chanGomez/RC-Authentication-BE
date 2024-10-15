const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/db"); // Import the PostgreSQL db from db.js
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

//middleware
const { authenticateToken } = require("../middleware/jwt-authorization");
const { validatePassword, validateEmail, validateUsername } = require("../middleware/validate");


//find a way to tell if user is first time login or not
//if first time login, then send a 2FA code to the user's email and no token will need authentication
//if not first time login, then send a 2FA code to the user's email and a token will need authentication

router.post("/register", validatePassword, validateEmail, validateUsername, async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExistsQuery = "SELECT * FROM users WHERE username = $1 OR email = $2";
    const userExists = await db.query(userExistsQuery, [username, email]);

    if (userExists.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }
    console.log(userExists);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertUserQuery =
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)";
    await db.query(insertUserQuery, [username, email, hashedPassword]);

    const token = jwt.sign({ username: username}, JWT_SECRET, {
      expiresIn: "5h",
    });

    res.status(201).json({ message: "New User registered successfully: " + username, token: token });
  } catch (error) {
    res.status(500).json({
      message: "Server error during registration",
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const findUserQuery =
      "SELECT * FROM users WHERE username = $1 OR email = $2";
    const userResult = await db.query(findUserQuery, [username, email]);

    if (userResult.length === 0) {
      return res.status(400).json({ message: "Username or email is incorrect" });
    }

    const user = userResult[0];

    // Check if the password matches with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    //Add 2 factor authentication here!!!

    // Generate a JWT
      const token = jwt.sign({ username: username }, JWT_SECRET, {expiresIn: "5h"});

    res.json({ message: "Successfully logged in", token: token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error during login", error: error.message });
  }
});

// Logout route (Token blacklisting)
router.post("/logout", authenticateToken, async (req, res) => {
  const token = req.user;
  console.log(token); // Token is now available from the authenticateToken middleware

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  try {
    // Add token to the blacklist
    const insertTokenQuery = 'INSERT INTO token_blacklist (token) VALUES ($1)';
    await db.query(insertTokenQuery, [token]);

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out", error: error.message });
  }
});



  module.exports = router;