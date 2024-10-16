const jwt = require("jsonwebtoken");
const redisClient = require("redis").createClient();

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

redisClient.connect().then(() => {
  console.log("Connected to Redis");
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

const verifyToken = async (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

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
        .json({ message: "Internal server error while accessing Redis for session token" });
    }

    if (!redisToken) {
      return res.status(401).json({ message: "Session expired or invalid" });
    }

    // req.user = decoded;
    next();
  } catch (err) {
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
