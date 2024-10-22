const supertest = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../app.js");

describe("GET /sign-up", () => {
  it("should return a message saying movie route with no token needed!!!", async () => {
    const res = await supertest(app).get("/movies");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe("movie route with no token needed!!!");
  });
});
