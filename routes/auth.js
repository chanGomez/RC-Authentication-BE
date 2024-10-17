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
const {
  authenticateToken,
  verifyToken,
} = require("../middleware/jwt-authorization");
const { 
  loginRateLimiter
} = require("../middleware/rateLimiter")
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
const {
  transporter,
  createResetPasswordEmail,
} = require("../utils/nodeMailer");

const {validateTOTP, registerTOTP} = require("../utils/secondAuth")

//find a way to tell if user is first time login or not
//if first time login, then send a 2FA code to the user's email and no token will need authentication
//if not first time login, then send a 2FA code to the user's email and a token will need authentication

const { registerTOTP } = require("./secondAuth"); // Import the TOTP function

router.post(
  "/register",
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

      const getNewUser = "SELECT * FROM users WHERE email = $1";
      const user = await db.query(getNewUser, [email]);

      //2Factor Auth
      const { qrCode, manualKey } = await registerTOTP(email);

      const token = jwt.sign({ user: user.id }, JWT_SECRET, {
        expiresIn: "1h",
      });

      res.status(201).json({
        message: "User registered successfully: " + username,
        token: token,
        qrCode: qrCode, // Return QR code for user to scan
        manualKey: manualKey, // Provide manual key as fallback
      });
    } catch (error) {
      res.status(500).json({
        message: "Server error during registration",
        error: error.message,
      });
    }
  }
);

router.post("/login", loginRateLimiter, async (req, res) => {
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
          message: "Too many failed attempts. You are locked out for 6 hours.",
        });
      }
      return res.status(400).json({ message: "Password is incorrect" });
    }

    //2Factor Auth
    if (user.totpSecret) {
      const totpValid = validateTOTP(user.email, token);

      if (!totpValid) {
        return res.status(400).json({ message: "Invalid TOTP token" });
      }
    }

    const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    await redisClient.set(`session_token:${user.id}`, jwtToken, { EX: 3600 });
    await redisClient.del(`login_attempts:${user.id}`);

    res.json({ message: "Successfully logged in", token: jwtToken });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error during login", error: error.message });
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

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const findUserQuery = "SELECT * FROM users WHERE email = $1";
    const userResult = await db.query(findUserQuery, [email]);

    if (userResult.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 900000); // Token expires in 15 mins

    const insertResetTokenQuery =
      "INSERT INTO reset_tokens (email, token, expiration_time) VALUES ($1, $2, $3)";
    await db.query(insertResetTokenQuery, [
      email,
      resetToken,
      resetTokenExpiry,
    ]);

    const resetUrl = `https://authenticatorrrr.netlify.app/reset-password?token=${resetToken}`;
    await transporter.sendMail(createResetPasswordEmail(email, resetUrl));

    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing request", error: error.message });
  }
});

// Reset password route
router.post("/reset-password", validatePassword, async (req, res) => {
  const { password } = req.body;
  const token = req.query.token;
  console.log("token: " + token);

  try {
    const checkTokenQuery =
      "SELECT * FROM reset_tokens WHERE token = $1 AND expiration_time > NOW()";
    const tokenResult = await db.query(checkTokenQuery, [token]);

    if (tokenResult.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatePasswordQuery =
      "UPDATE users SET password = $1 WHERE email = $2";
    await db.query(updatePasswordQuery, [hashedPassword, tokenResult[0].email]);

    const clearTokenQuery = "DELETE FROM reset_tokens WHERE token = $1";
    await db.query(clearTokenQuery, [token]);

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error during password reset",
        error: error.message,
      });
  }
});

module.exports = router;
