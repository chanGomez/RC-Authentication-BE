const geoip = require("geoip-lite");
const { transporter, newBrowserAlert } = require("../utils/nodeMailer");
const db = require("../db/db.js"); // Assuming db is the database connection module

const checkNewLoginByIP = async (req, res, next) => {
  const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;
  const { email } = req.body;

  try {
    const geo = geoip.lookup(ipAddress);
    const ipInfo = `${ipAddress}|${geo ? geo.country : "unknown"}`;
    console.log("here")

      const userExistsQuery = "SELECT * FROM users WHERE email = $1";
      const userExists = await db.query(userExistsQuery, [email]);

      if (userExists.length == 0) {
        return res.status(400).json({ message: "Email is not registered." });
      }

    if(user.length == 0){
    return res
      .status(401)
      .json({
        error: err,
        message: "Email not registered to the site.",
      });
    }
    console.log("here");

    const query = "SELECT ip_address FROM sessions_by_ip WHERE userId = $1";
    const values = [user.id];
    const result = await db.query(query, values);

    if (!result.rows.some(row => row.ip_address === ipInfo)) {
      // new browser alert to email
    console.log("here")

      await transporter.sendMail(newBrowserAlert(email));
         const currentTimeStamp = new Date(Date.now() + 900000);
      const insertQuery =
        "INSERT INTO sessions_by_ip (userId, login_attempt_time, ip_address) VALUES ($1, $2, $3)";
      await db.query(insertQuery, [user.id, currentTimeStamp, ipInfo]);
      return true;
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: err, message: "Server error during login IP address check" });
  }
};

module.exports = { checkNewLoginByIP };
