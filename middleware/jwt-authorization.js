const jwt = require("jsonwebtoken");


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

module.exports = {
  authenticateToken,
};
