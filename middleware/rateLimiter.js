const rateLimit = require("express-rate-limit");
const redisClient = require("../utils/redisClient");

const loginRateLimiter = async (req, res, next) => {
  const ipAddress =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;
  const loginKey = `login_attempts_IP_address:${ipAddress}`;

  // Get the number of login attempts from Redis
  const attempts = (await redisClient.get(loginKey)) || 0;

  if (attempts >= 2) {
    return res.status(429).json({
      message: "Too many login attempts, please try again after 1 minute.",
    });
  }

  // Increase the login attempts
  await redisClient.incr(loginKey);

  // Set expiration of 1 minute for the login attempts key
  await redisClient.expire(loginKey, 60);

  next();
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  headers: true, // Include rate limit info in headers
});


module.exports = { loginRateLimiter, apiLimiter };
