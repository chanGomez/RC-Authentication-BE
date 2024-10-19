const geoip = require("geoip-lite");
const { transporter, newBrowserAlert } = require("../utils/nodeMailer");
const db = require("../db/db.js");

const checkNewLoginByIP = async (req, res, next) => {
  const ipAddress =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;
  const { email } = req.body;

  try {
    const geo = geoip.lookup(ipAddress);
    const ipInfo = `${ipAddress}|${
      geo && geo.country ? geo.country : "unknown"
    }`;

    const userExistsQuery = "SELECT * FROM users WHERE email = $1";
    const user = await db.query(userExistsQuery, [email]);

    if (user.length === 0) {
      return res.status(400).json({ message: "Email is not registered." });
    }

    const query = "SELECT ip_address FROM sessions_by_ip WHERE userId = $1";
    const result = await db.query(query, [user[0].id]);

    // First time login, just save the IP address for future alerts
    if (result.length === 0) {
      const insertQuery =
        "INSERT INTO sessions_by_ip (userId, ip_address) VALUES ($1, $2)";
      await db.query(insertQuery, [user[0].id, ipInfo]);
      return next(); // Proceed to the next middleware
    }

    // Check for new IP address
    if (!result.some((res) => res.ip_address === ipInfo)) {
      // New IP alert to email
      await transporter.sendMail(newBrowserAlert(email));
      const currentTimeStamp = Date.now();
      const insertQuery =
        "INSERT INTO sessions_by_ip (userId, login_attempt_time, ip_address) VALUES ($1, $2, $3)";
      await db.query(insertQuery, [user[0].id, currentTimeStamp, ipInfo]);
    }

    next(); // Proceed to the next middleware
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res
      .status(500)
      .json({ message: "Server error during login IP address check" });
  }
};

module.exports = { checkNewLoginByIP };
