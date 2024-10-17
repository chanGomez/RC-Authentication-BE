const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

  let redisClient;

  beforeEach(() => {
    redisClient = redis.createClient(); // Create a new Redis client before each test
  });

  afterEach(() => {
    // redisClient.flushAll(); // Clear all mock Redis data between tests
    redisClient.quit(); // Close the Redis client to prevent open handles
  });