const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const redisClient = require("../utils/redisClient");

const {
  getUserByEmail,
  getUserByUsername,
  createUser,
} = require("../queries/authQueries");

const {
  validatePassword,
  validateEmail,
  validateUsername,
} = require("../middleware/validate");

const { isUserLockedByUserAndIP } = require("../utils/loginTracker");

const { checkNewLoginByIP } = require("../middleware/newLoginIP");
const { verifyTokenFromCookies } = require("../middleware/jwt-authorization");
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
      if (foundUserByEmail.id) {
        res.status(200).json({ message: "Email already registered." });
      }
      const foundUserByUsername = await getUserByUsername(username);
      if (foundUserByUsername.id) {
        res.status(200).json({ message: "Username not available." });
      }
      //make user
      const hashedPassword = await bcrypt.hash(password, 10);
      const userCreate = await createUser({
        username: username,
        email: email,
        hashedPassword: hashedPassword,
      });

      res
        .status(200)
        .json({ message: "User was successfully created in database." });
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
    //Here is where you would check the user has 2fa enabled in db to make sure
    //that if they did not enabled it then they should now
    const foundUserByEmail = await getUserByEmail(email);

    // Generate TOTP and save Secret for the user
    const { qrCode, otpauthURL, manualKey, token } = await registerTOTP(email);

    res.status(201).json({
      message: "User registered, QR code created",
      qrCode: qrCode,
      otpauthURL: otpauthURL,
      manualKey: manualKey, // Provide manual key as fallback
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

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        //tracking failed attempts by user and IP address
        let lockedOutResult = await isUserLockedByUserAndIP(user.id, ipAddress);
        if (lockedOutResult.locked === true) {
          return res
            .status(400)
            .json({ message: `${lockedOutResult.message}` });
        }

        return res.status(400).json({ message: "Password is incorrect." });
      }

      await redisClient.del(`login_attempts:${user.id}`);
      return res.status(200).json({
        message: "Successfully logged in with email and password",
      });
    } catch (error) {
      res.status(500).json({ error: "Error in sign in." });
    }
  }
);

router.post("/verify2fa", loginRateLimiter, async (req, res) => {
  const { email, totp_token } = req.body;

  try {
    const user = await getUserByEmail(email);

    //verify token sent by user
    const isTOTPValid = await validateTOTP(email, totp_token);
    if (!isTOTPValid) {
      return res.status(400).json({ message: "Invalid TOTP token" });
    }

    const jwtToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set JWT token in a secure HttpOnly cookie
    res.cookie("jwt_token", jwtToken, {
      httpOnly: true, // Prevent JavaScript from accessing the token
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      sameSite: "Strict", // Protect against CSRF
      maxAge: 60 * 60 * 1000, // 1 hour expiration
    });

    //token session started for session management  in redis
    await redisClient.set(`session_token:${user.id}`, jwtToken, { EX: 3600 });
    res.json({
      message: "2 factor verification successful",
      jwtToken: jwtToken,
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.post("/logout", verifyTokenFromCookies, async (req, res) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Remove session from Redis
    await redisClient.del(`session_token:${userId}`);

    // Clear the cookie
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging out", error: error.message });
  }
});

router.get("/find-email", async (req, res) => {
  const { email } = req.body;
  try {
    const foundUser = await getUserByEmail(email);

    res.status(200).json(foundUser);
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});
module.exports = router;
