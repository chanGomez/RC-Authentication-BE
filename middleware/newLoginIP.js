const geoip = require("geoip-lite");
const { transporter, newBrowserAlert } = require("./nodeMailer");
const db = require("../db"); // Assuming db is the database connection module

const checkNewLoginByIP = async (req, res, next) => {
  const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;
  const { email } = req.body;

  try {
    const geo = geoip.lookup(ipAddress);
    const ipInfo = `${ipAddress}|${geo ? geo.country : "unknown"}`;

    const userExistsQuery = "SELECT * FROM users WHERE email = $1";
    const user = await db.query(userExistsQuery, [email]);
    const query = "SELECT ip_address FROM sessions_by_ip WHERE userId = $1";
    const values = [user.id];
    const result = await db.query(query, values);

    if (!result.rows.some(row => row.ip_address === ipInfo)) {
      // new browser alert to email
      await transporter.sendMail(newBrowserAlert(email));
      const insertQuery = "INSERT INTO sessions_by_ip (userId, ip_address) VALUES ($1, $2)";
      await db.query(insertQuery, [user.id, ipInfo]);
      return true;
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: err, message: "Server error during login IP address check" });
  }
};

module.exports = { checkNewLoginByIP };
