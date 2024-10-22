// const request = require("supertest");
// const server = require("../../server"); // Assuming your express server is exported here
// const db = require("../../db/db.js"); // Mock your database connection
// const bcrypt = require("bcrypt");
// const { registerTOTP } = require("../../utils/secondAuth.js"); // Mock your TOTP function

// //third party libary to mock DB

// jest.mock("../../db/db.js"); // Mock the database
// jest.mock("bcrypt"); // Mock bcrypt
// jest.mock("../../utils/secondAuth.js"); // Mock the TOTP function

// describe("POST /sign-up", () => {
//   afterEach(() => {
//     jest.clearAllMocks(); // Clear mocks after each test
//   });

//   it("should register a new user", async () => {
//     const mockUser = {
//       username: "testuser",
//       email: "testuser@test.com",
//       password: "Password123!",
//     };

//     db.query.mockResolvedValueOnce([]); // No user found

//     bcrypt.hash.mockResolvedValueOnce("hashedPassword123");

//     db.query.mockResolvedValueOnce([
//       { id: 1, username: "testuser", email: "testuser@test.com" },
//     ]);

//     registerTOTP.mockResolvedValueOnce({
//       qrCode: "fakeQrCode",
//       manualKey: "fakeManualKey",
//     });

//     const res = await request(server).post("/sign-up").send(mockUser);

//     expect(res.statusCode).toBe(201);
//     expect(res.body.message).toBe("User registered successfully: testuser");
//     expect(res.body.qrCode).toBe("fakeQrCode");
//     expect(res.body.manualKey).toBe("fakeManualKey");
//   });

//   it("should return 400 if user already exists", async () => {
//     const mockUser = {
//       username: "testuser",
//       email: "testuser@test.com",
//       password: "password123",
//     };

//     // Mock the database to return an existing user
//     db.query.mockResolvedValueOnce([{ id: 1, email: "testuser@test.com" }]);

//     const res = await request(server).post("/sign-up").send(mockUser);

//     // expect(res.statusCode).toBe(400);
//     expect(res.body.message).toBe("User already exists");
//   });

//   it("should handle server error", async () => {
//     const mockUser = {
//       username: "testuser",
//       email: "testuser@test.com",
//       password: "password123",
//     };

//     // Mock a database error
//     db.query.mockRejectedValueOnce(new Error("Database failure"));

//     const res = await request(server).post("/sign-up").send(mockUser);

//     expect(res.statusCode).toBe(500);
//     expect(res.body.message).toBe("Server error during registration");
//   });
// });


// describe("use")