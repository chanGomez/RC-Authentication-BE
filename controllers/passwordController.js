const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const {
  insertResetToken,
  checkResetToken,
  updatePassword,
  deleteResetToken,
} = require("../queries/passwordQueries");

const { getUserByEmail } = require("../queries/authQueries");

const {
  transporter,
  createResetPasswordEmail,
} = require("../utils/nodeMailer");

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const foundUser = await getUserByEmail(email);

    if (foundUser.name == "QueryResultError") {
      res.status(401).json({
        message: "Email not registered",
      });
    }

    //create reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 900000);
    const tokenInserted = await insertResetToken({
      userId: foundUser.id,
      resetToken: resetToken,
      resetTokenExpiry: resetTokenExpiry,
    });

    const resetUrl =
      process.env.NODE_ENV === "development"
        ? `http://localhost:5173/reset-password?id=${foundUser.id}&token=${resetToken}`
        : `https://authenticatorrrr.netlify.app/reset-password?id=${foundUser.id}&token=${resetToken}`;

    const resetEmail = await transporter.sendMail(
      createResetPasswordEmail(email, resetUrl)
    );

    res.status(200).json({
      foundUser: foundUser,
      tokenInserted: tokenInserted,
      resetEmail: resetEmail,
    });
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

router.post("/reset-password", async (req, res) => {
  const { password, id, token } = req.body;

  try {
    const validToken = await checkResetToken(token);

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedPassword = await updatePassword(hashedPassword, id);

    const deletedToken = await deleteResetToken(token);

    res.status(200).json({
      token: validToken,
      password: updatedPassword,
      deletedToken: deletedToken,
    });
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

module.exports = router;
