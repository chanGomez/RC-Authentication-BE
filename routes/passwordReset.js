// const express = require("express");
// const bcrypt = require("bcrypt");
// const db = require("../db/db");
// const router = express.Router();
// const crypto = require("crypto");

// const {
//   transporter,
//   createResetPasswordEmail,
// } = require("../utils/nodeMailer");

// const {
//   validatePassword,
//   validateEmail,
//   validateUsername,
// } = require("../middleware/validate");


// router.post("/forgot-password", async (req, res) => {
  // const { email } = req.body;
  // console.log("forgot password email", email)

  // try {
  //   const findUserQuery = "SELECT * FROM users WHERE email = $1";
  //   const userResult = await db.query(findUserQuery, [email]);
  //   let user = userResult[0]
  // console.log("forgot password user", userResult);


    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    // const resetToken = crypto.randomBytes(20).toString("hex");
    // const resetTokenExpiry = new Date(Date.now() + 900000); // Token expires in 15 mins

    // const insertResetTokenQuery =
    //   "INSERT INTO reset_tokens (email, token, expiration_time) VALUES ($1, $2, $3)";
    // await db.query(insertResetTokenQuery, [
    //   email,
    //   resetToken,
    //   resetTokenExpiry,
    // ]);

    // const resetUrl = `https://authenticatorrrr.netlify.app/reset-password?token=${resetToken}`;
    // await transporter.sendMail(createResetPasswordEmail(email, resetUrl));

//     res.json({ message: "Password reset link sent to your email" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error processing request", error: error.message });
//   }
// });

// Reset password route
// router.post("/reset-password", validatePassword, async (req, res) => {
  // const { password } = req.body;
  // const token = req.query.token;
  // console.log("token: " + token);

  // try {
    // const checkTokenQuery =
    //   "SELECT * FROM reset_tokens WHERE token = $1 AND expiration_time > NOW()";
    // const tokenResult = await db.query(checkTokenQuery, [token]);

    // if (tokenResult.length === 0) {
    //   return res.status(400).json({ message: "Invalid or expired token" });
    // }
    // const hashedPassword = await bcrypt.hash(password, 10);

    // const updatePasswordQuery =
    //   "UPDATE users SET password = $1 WHERE email = $2";
    // await db.query(updatePasswordQuery, [hashedPassword, tokenResult[0].email]);

    // const clearTokenQuery = "DELETE FROM reset_tokens WHERE token = $1";
    // await db.query(clearTokenQuery, [token]);

//     res.json({ message: "Password reset successful" });
//   } catch (error) {
//     res.status(500).json({
//       message: "Server error during password reset",
//       error: error.message,
//     });
//   }
// });

// module.exports = router;