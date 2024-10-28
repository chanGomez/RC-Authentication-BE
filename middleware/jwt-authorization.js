const jwt = require("jsonwebtoken");
const redisClient = require("../utils/redisClient");

const MAX_FAILED_ATTEMPTS = 5;
const BLOCK_DURATION = 900;

const verifyTokenFromCookies = async (req, res, next) => {
  const token = req.cookies.token; 

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let redisToken;
    try {
      redisToken = await redisClient.get(`session_token:${decoded.userId}`);

    } catch (err) {
      return res
        .status(500)
        .json({
          message:
            "Internal server error while accessing Redis for session token",
        });
    }
    
    if (!redisToken) {
      return res.status(401).json({ message: "Session expired or token invalid" });
    }

    // Reset failed attempts for this IP on successful verification
    await redisClient.del(`failed_attempts:${ipAddress}`);

    next();
  } catch (err) {
    // Check rate limit for failed attempts
    const failedAttempts = await redisClient.incr(
      `failed_attempts:${ipAddress}`
    );
    await redisClient.expire(`failed_attempts:${ipAddress}`, BLOCK_DURATION);

    if (failedAttempts > MAX_FAILED_ATTEMPTS) {
      return res.status(429).json({
        message: "Too many failed attempts. Please try again later.",
        retryAfter: "15 minutes",
      });
    }

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

// const verifyTokenFromCookies = (req, res, next) => {
//   const token = req.cookies.token; // Get the token from the cookies

//   if (!token) {
//     return res.status(403).json({ message: "No token provided" });
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Unauthorized access" });
//     }

//     req.userId = decoded.userId; // Attach userId to request object
//     next();
//   });
// };


module.exports = {
  verifyTokenFromCookies,
};
