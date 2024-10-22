const geoip = require("geoip-lite");
const { transporter, newBrowserAlert } = require("../utils/nodeMailer");
const db = require("../db/db.js");
const { getUserByEmail } = require("../queries/authQueries.js");

const checkNewLoginByIP = async (req, res, next) => {
  const ipAddress = req.headers["x-forwarded-for"]
    ? req.headers["x-forwarded-for"].split(",")[0]
    : req.socket.remoteAddress || req.ip;
  const { email } = req.body;

  try {
    const user = await getUserByEmail(email);
    console.log("useerrrrrrr", user);
    if (user.message == "No data returned from the query.") {
      return res.status(400).json({ message: "Email is not registered." });
    }

    const geo = geoip.lookup(ipAddress);
    const country = geo && geo.country ? geo.country : null;
    const ipInfo = `${ipAddress}|${country || "unknown"}`;

    const query = "SELECT ip_address FROM sessions_by_ip WHERE userId = $1";
    const result = await db.query(query, [user.id]);
    console.log(result);

    // First time login, save IP address
    if (result) {
      const insertQuery =
        "INSERT INTO sessions_by_ip (userId, ip_address) VALUES ($1, $2)";
      await db.query(insertQuery, [user.id, ipInfo]);
      return next();
    }

    // Check for new IP address
    if (!result.some((res) => res.ip_address === ipInfo)) {
      // Check if last login was recent (e.g., within 24 hours)
      //This is a cool down period before sending another "new IP" email alert to only send one alert per day for the same user
      const recentLoginQuery =
        "SELECT login_attempt_time FROM sessions_by_ip WHERE userId = $1 ORDER BY login_attempt_time DESC LIMIT 1";
      const recentLogin = await db.query(recentLoginQuery, [user.id]);
      const oneDayInMillis = 24 * 60 * 60 * 1000;
      const lastLoginTime = recentLogin[0]?.login_attempt_time || 0;

      //send email to alert user new IP address detected
      if (Date.now() - lastLoginTime > oneDayInMillis) {
        await transporter.sendMail(newBrowserAlert(email));
        return res
          .status(401)
          .json({ message: "New Browser detected. Email alert sent." });
      }

      const insertQuery =
        "INSERT INTO sessions_by_ip (userId, ip_address) VALUES ($1, $2)";
      await db.query(insertQuery, [user.id, ipInfo]);
    }

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error during login IP address check",
    });
  }
};

module.exports = { checkNewLoginByIP };
