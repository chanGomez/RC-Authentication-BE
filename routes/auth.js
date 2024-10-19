const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/db");
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const crypto = require("crypto");
const redisClient = require("redis").createClient();

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

redisClient.connect().then(() => {
  console.log("Connected to Redis in auth");
});

//middleware
const { checkNewLoginByIP } = require("../middleware/newLoginIP");
const { verifyToken } = require("../middleware/jwt-authorization");
const { loginRateLimiter } = require("../middleware/rateLimiter");
const {
  validatePassword,
  validateEmail,
  validateUsername,
} = require("../middleware/validate");
const {
  isUserLockedByUserAndIP,
  trackFailedLoginByUser,
  trackFailedLoginByIP,
} = require("../utils/loginTracker");

const { validateTOTP, registerTOTP } = require("../utils/TOTP");

//find a way to tell if user is first time login or not
//if first time login, then send a 2FA code to the user's email and no token will need authentication
//if not first time login, then send a 2FA code to the user's email and a token will need authentication

//notes to help with unit testing---
//1.
//helper function to see if user exists - getUser
//if true
//return error
//else function create user
//create small test for helper functions and then work up to testing routes
//2.
//query dictionary

router.post(
  "/sign-up",
  validatePassword,
  validateEmail,
  validateUsername,
  async (req, res) => {
    const { username, email, password } = req.body;

    try {
      const userExistsQuery = "SELECT * FROM users WHERE email = $1";
      const userExists = await db.query(userExistsQuery, [email]);

      if (userExists.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertUserQuery =
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)";
      await db.query(insertUserQuery, [username, email, hashedPassword]);

      //should I use email instead of user id?
      const getNewUser = "SELECT * FROM users WHERE email = $1";
      const user = await db.query(getNewUser, [email]);


      const { qrCode, manualKey } = await registerTOTP(email);
       if (qrCode){
         return res.json({
           message:
             "User registered successfully. Scan the QR code to enable 2FA.",
           qrCode, // Return the QR code to be displayed on the frontend
           manualKey, // Manual key as a backup
         });
       }

      //-------should I be issuing token for registration?
      const token = jwt.sign({ user: user.id }, JWT_SECRET, {
        expiresIn: "1h",
      });

      return res.json({ message: "Successfully logged in", token: token });
    } catch (error) {
      res.status(500).json({
        message: "Server error during registration",
        error: error.message,
      });
    }
  }
);

router.post(
  "/sign-in",
  loginRateLimiter,
  checkNewLoginByIP,
  async (req, res) => {
    const { email, password, token } = req.body;
    const ipAddress =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;

    try {
      const findUserQuery = "SELECT * FROM users WHERE email = $1";
      const userResult = await db.query(findUserQuery, [email]);

      if (userResult.length === 0) {
        return res
          .status(400)
          .json({ message: "Username or email is incorrect" });
      }
      const user = userResult[0];

      // Check if the user is locked out by userID and IP address
      let lockedOutResult = await isUserLockedByUserAndIP(user.id, ipAddress);
      if (lockedOutResult.locked === true) {
        return res.status(400).json({ message: `${lockedOutResult.message}` });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        const resultUser = await trackFailedLoginByUser(user.id, email);
        const resultIP = await trackFailedLoginByIP(user.id, ipAddress);
        if (resultUser.locked === true || resultIP.locked === true) {
          return res.status(400).json({
            message:
              "Too many failed attempts. You are locked out for 6 hours.",
          });
        }
        return res.status(400).json({ message: "Password is incorrect" });
      }

      const { qrCode, manualKey } = await registerTOTP(email);

      //once user logins the login attempts gets deleted
      await redisClient.del(`login_attempts:${user.id}`);
      return res.json({
        message: "TOTP setup successful",
        qrCode, // Return the QR code to be displayed on the frontend
        manualKey, // Provide a manual key as a fallback option
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Server error during login", error: error.message });
    }
  }
);

// Endpoint to verify the two-way authentication code
router.post("/verify", async (req, res) => {
  const { email, token } = req.body;

  try {
    const findUserQuery = "SELECT * FROM users WHERE email = $1";
    const user = await db.query(findUserQuery, [email]);

    const result = await validateTOTP(email, token);
    console.log(result);

    const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    //toke session started for session management
    await redisClient.set(`session_token:${user.id}`, jwtToken, { EX: 3600 });
    res.json({ message: "sign in successful ", token: jwtToken });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging out", error: error.message });
  }
});

router.post("/logout", verifyToken, async (req, res) => {
  const token = req.user;
  console.log(token);

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  try {
    const insertTokenQuery = "INSERT INTO token_blacklist (token) VALUES ($1)";
    await db.query(insertTokenQuery, [token]);

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging out", error: error.message });
  }
});

module.exports = router;
