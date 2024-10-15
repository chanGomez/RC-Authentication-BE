const jwt = require("jsonwebtoken");


function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]; //bearer Token
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json({ error: "Null token" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
    if (error) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  });
}

module.exports = {
  authenticateToken,
};
