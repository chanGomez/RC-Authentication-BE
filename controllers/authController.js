const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/db");
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const crypto = require("crypto");
const redisClient = require("redis").createClient();

//turn redis on
redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});
redisClient.connect().then(() => {
  console.log("Connected to Redis in auth");
});

const {
  getUserByEmail,
  getUserByUsername,
  createUser,
  blacklistToken,
} = require("../queries/authQueries");

const {
  validatePassword,
  validateEmail,
  validateUsername,
} = require("../middleware/validate");

const { checkNewLoginByIP } = require("../middleware/newLoginIP");
const { verifyToken } = require("../middleware/jwt-authorization");
const { loginRateLimiter } = require("../middleware/rateLimiter");
const { validateTOTP, registerTOTP } = require("../utils/TOTP");

router.post(
  "/sign-up",
  validatePassword,
  validateEmail,
  validateUsername,
  async (req, res) => {
    const { username, email, password } = req.body;
    try {
      //check if user already exists
      const foundUserByEmail = await getUserByEmail(email);
      const foundUserByUsername = await getUserByUsername(username);

      //make user
      const hashedPassword = await bcrypt.hash(password, 10);
      const userCreate = await createUser({
        username: username,
        email: email,
        hashedPassword: hashedPassword,
      });

      res.status(200).json({
        foundUserByEmail: foundUserByEmail,
        foundUserByUsername: foundUserByUsername,
        userCreate: userCreate,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error during Login with email and password",
        error: error.message,
      });
    }
  }
);

router.post("/enable2fa", async (req, res) => {
  const { email } = req.body;

  try {
    const foundUserByEmail = await getUserByEmail(email);

    // Generate TOTP and save Secret for the user
    const { qrCode, manualKey, token } = await registerTOTP(email);
    console.log("enable user qrcode info: ", qrCode, manualKey, token);

    res.status(201).json({
      foundUserByEmail: foundUserByEmail,
      message: "User registered, QR code created " + email,
      qrCode: qrCode, // Return QR code for user to scan
      manualKey: manualKey, // Provide manual key as fallback
      token: token, // Token for testing purposes
    });
  } catch (error) {
    res.status(500).json({
      message: "Error during QR code creation",
      error: error.message,
    });
  }
});

router.post(
  "/sign-in",
  loginRateLimiter,
  checkNewLoginByIP,
  async (req, res) => {
    const { email, password } = req.body;
    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      req.ip;

    if (!ipAddress) {
      return res
        .status(400)
        .json({ message: "Unable to determine IP address" });
    }

    try {
      const user = await getUserByEmail(email);

      //check if user is locked out
      let lockedOutResult = await isUserLockedByUserAndIP(user.id, ipAddress);
      if (lockedOutResult.locked === true) {
        return res.status(400).json({ message: `${lockedOutResult.message}` });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        //tracking failed attempts by user and IP address
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

      await redisClient.del(`login_attempts:${user.id}`);
      return res.status(200).json({
        message: "Successfully logged in with email and password",
      });
    } catch (error) {
      res.status(404).json({ error: error });
    }
  }
);

router.post("/verify2fa", loginRateLimiter, async (req, res) => {
  const { email, totp_token } = req.body;
  console.log("body", req.body);

  try {
    const user = await getUserByEmail(email);
    //verify token sent by user
    const isTOTPValid = await validateTOTP(email, totp_token);
    if (!isTOTPValid) {
      return res.status(400).json({ message: "Invalid TOTP token" });
    }

    const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    //toke session started for session management  in redis
    await redisClient.set(`session_token:${user.id}`, jwtToken, { EX: 3600 });
    res.json({
      message: "2 factor verification successful",
      jwtToken: jwtToken,
    });
  } catch (error) {
    res.status(404).json({ error: error });
  }
});

router.post("/logout", verifyToken, async (req, res) => {
  const token = req.user;
  console.log(token);

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  try {
    const insertTokenToBlacklist = blacklistToken(token);
    res.json({
      insertTokenToBlacklist: insertTokenToBlacklist,
      message: "Logged out successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging out", error: error.message });
  }
});

module.exports = router;
