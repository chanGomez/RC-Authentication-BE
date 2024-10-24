const supertest = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../app.js");

describe("GET /movies", () => {
  it("should return a message saying movie route with no token needed!!!", async () => {
    const res = await supertest(app).get("/movies");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe("movie route with no token needed!!!");
  });
});

describe("GET /cookie-token", () => {
  it("should return 200 and message when token is valid", async () => {
    // Generate a valid token using the same secret and structure
    const validToken = jwt.sign({ userId: "12345" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const response = await supertest(app)
      .get("/movies/get-movies")
      .set("Cookie", [`token=${validToken}`]); // Set the cookie header with valid JWT

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("Token verified through cookies!!");
  });

  it("should return 403 when no token is provided", async () => {
    const response = await supertest(app).get("/movies/get-movies"); // No cookie set

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("No token provided");
  });

  it("should return 401 when token is invalid", async () => {
    const invalidToken = "invalidToken";

    const response = await supertest(app)
      .get("/movies/get-movies")
      .set("Cookie", [`token=${invalidToken}`]); // Set invalid token in the cookie

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Unauthorized access");
  });
});

