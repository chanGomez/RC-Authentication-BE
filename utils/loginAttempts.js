const redisClient = require("redis").createClient();
const nodemailer = require("nodemailer");

const { transporter, lockedOutEmail } = require("./nodeMailer");

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

redisClient.connect().then(() => {
  console.log("Connected to Redis");
});


const trackFailedLogin = async (email) => {
  const key = `login_attempts:${email}`;
  const attempts = await redisClient.get(key);
  console.log("attempts", attempts);

  if (attempts) {
    await redisClient.incr(key);
    const updatedAttempts = parseInt(attempts) + 1;

    if (updatedAttempts >= 3) {
      await transporter.sendMail(lockedOutEmail(email));
      await redisClient.set(`lockout:${email}`, "true", { EX: 21600 }); // 6 hours
      await redisClient.del(key); // Reset attempts count
      return { locked: true };
    }
  } else {
    await redisClient.set(key, 1, { EX: 900 }); // 900 seconds = 15 minutes
  }
  return { locked: false };
};

const isUserLocked = async (email) => {
  const isLocked = await redisClient.get(`lockout:${email}`);
  return isLocked;
};

module.exports = { trackFailedLogin, isUserLocked  };
