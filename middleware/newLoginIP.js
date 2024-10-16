const geoip = require("geoip-lite");
const redisClient = require("redis").createClient();
const { transporter, newBrowserAlert } = require("./nodeMailer");

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

redisClient.connect().then(() => {
  console.log("Connected to Redis");
});

const checkNewLogin = async (req, res, next) => {
const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;
  const { email } = req.body;
  const key = `userIP:${email}`;


  try {
    const storedIPs = await redisClient.sMembers(key);
    const geo = geoip.lookup(ipAddress);
    const ipInfo = `${ipAddress}|${geo ? geo.country : "unknown"}`;


    if (!storedIPs.includes(ipInfo)) {
        //new browser alert to email
      await transporter.sendMail(newBrowserAlert(email));
      await redisClient.sAdd(key, ipInfo);
      return true;
    }

    return false;
  } catch (err) {
    return res.status(401).json({ error: err, message: "Sever error during login IP address check" });
  }
};

module.exports = { checkNewLogin };
