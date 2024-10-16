const redisClient = require("redis").createClient();
const nodemailer = require("nodemailer");

const { transporter, lockedOutEmail } = require("./nodeMailer");

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

redisClient.connect().then(() => {
  console.log("Connected to Redis");
});

//track failed login attempts and IP address
const trackFailedLogin = async (userID, email, req) => {
  const ipAddress = req.ip;
  const ipKey = `login_attempts_IP:${ipAddress}`;
  const attempts = await redisClient.get(ipKey);

  if (attempts) {
    await redisClient.incr(ipKey);
    const updatedAttempts = parseInt(attempts) + 1;

    if (updatedAttempts >= 3) {
      await transporter.sendMail(lockedOutEmail(email));
      await redisClient.set(`lockout_IP:${ipAddress}`, {status:"true", userID:userID }, { EX: 21600 }); // 6 hours
      await redisClient.del(ipKey); // Reset IP attempts count
      return { locked: true };
    }
  } else {
    await redisClient.set(ipKey, 1, { EX: 900 }); // 900 seconds = 15 minutes
  }
  return { locked: false };
};


const isUserLocked = async (email) => {
  const isLocked = await redisClient.get(`lockout:${email}`);
  return isLocked;
};

module.exports = { trackFailedLogin, isUserLocked  };
