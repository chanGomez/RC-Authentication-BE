const supertest = require("supertest");
const app = require("../../app.js");
const db = require("../../db/db");

describe("POST /sign-up", () => {
  it("should create user in database", async () => {
    const response = await supertest(app).post("/auth/sign-up").send({
      username: "testuser",
      email: "test@example.com",
      password: "ValidPass123!",
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "User was successfully created in database."
    );

    const email = "test@example.com";
    const userInfo = await db.one("DELETE FROM users WHERE email=$1", email);
  });
});

describe("POST /enable2fa", () => {
  it("should create a qrcode, manual key, and token for user", async () => {
    const email = "user1@example.com";

    const response = await supertest(app).post("/auth/enable2fa").send({
      username: email,
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe(
      "User registered, QR code created"
    );
  });
});
