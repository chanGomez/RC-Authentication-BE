const jwt = require("jsonwebtoken");
const redisClient = require("redis").createClient();

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

redisClient.connect().then(() => {
  console.log("Connected to Redis in JWT token auth");
});

function authenticateToken(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];
    console.log(token);
  if (token == null) return res.status(401).json({ error: "Null token" });

  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error && error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    if (error) return res.status(401).json({ error: "Invalid token" });

    req.user = user;
    next();
  });
}

const MAX_FAILED_ATTEMPTS = 5;
const BLOCK_DURATION = 900;

const verifyToken = async (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
      const ipAddress =
        req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;

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
        retryAfter: BLOCK_DURATION,
      });
    }

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};


module.exports = {
  authenticateToken,
  verifyToken,
};
