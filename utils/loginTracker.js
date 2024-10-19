const redisClient = require("redis").createClient();
const { transporter, lockedOutEmail } = require("./nodeMailer");

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

redisClient.connect().then(() => {
  console.log("Connected to Redis login tracker");
});

const trackFailedLoginByUser = async (userId, email) => {
  const key = `login_attempts:${userId}`;
  const attempts = await redisClient.get(key);

  if (attempts) {
    await redisClient.incr(key);

    if (attempts >= 2) {
      await transporter.sendMail(lockedOutEmail(email));
      await redisClient.set(`lockedOutUser:${userId}`, "true", { EX: 21600 });
      await redisClient.del(key);
      return { locked: true };
    }
  } else {
    await redisClient.set(key, 1, "EX", 300);
  }

  return { locked: false };
};

//track failed login attempts and IP address
const trackFailedLoginByIP = async (userID, ipAddress) => {
  const ipKey = `login_attempts_IP:${ipAddress}`;
  const attempts = await redisClient.get(ipKey);

  if (attempts) {
    await redisClient.incr(ipKey);

    if (attempts >= 2) {
      await redisClient.set(
        `lockedOut_IP:${ipAddress}`,
        { locked: "true", userID: userID },
        { EX: 21600 }
      );

      await redisClient.del(ipKey); // Reset IP attempts count new redis key made for locked out users
      return { locked: true };
    }
  } else {
    await redisClient.set(ipKey, 1, { EX: 300000 });
  }
  return { locked: false };
};

const isUserLockedByUserAndIP = async (userId, ipAddress) => {
  const accountResult = await redisClient.get(`lockedOutUser:${userId}`);
  const ipResult = await redisClient.get(`lockedOut_IP:${ipAddress}`);

  if (accountResult) {
    return { locked: true, message: "Account is temporarily locked." };
  }

  if (ipResult) {
    const ipResultObj = JSON.parse(ipResult);
    if (ipResultObj.locked == true) {
      return { locked: true, message: "IP is temporarily blocked." };
    }
  }

  return { locked: false };
};

module.exports = {
  trackFailedLoginByIP,
  isUserLockedByUserAndIP,
  trackFailedLoginByUser,
};
