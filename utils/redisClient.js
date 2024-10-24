const redis = require("redis");

const redisClient = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: "redis-12125.c263.us-east-1-2.ec2.redns.redis-cloud.com",
    port: 12125,
  },
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

redisClient
  .connect()
  .then(() => console.log("Connected to Redis"))
  .catch((err) => console.error("Redis connection failed:", err));

module.exports = redisClient;
