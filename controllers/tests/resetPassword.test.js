const supertest = require("supertest");
const app = require("../../app.js");
const db = require("../../db/db");


describe("POST /forgot-password", () => {
  it("should create a reset token and send an email to the user", async () => {

    const response = await supertest(app).post("/auth/forgot-password").send({
      email: "user1@example.com"
    });

    expect(response.status).toBe(200);
    // expect(response.body.message).toBe(
    //   "Reset toke created and email with rest password link sent."
    // );

  });
});