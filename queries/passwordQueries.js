const db = require("../db/db");

const insertResetToken = async ({ userId, resetToken, resetTokenExpiry }) => {
  try {
    const userInfo = await db.one(
      "INSERT INTO reset_tokens (email, token, expiration_time) VALUES ($1, $2, $3)",
      [userId, resetToken, resetTokenExpiry]
    );
    return userInfo;
  } catch (error) {
    return error;
  }
};

const checkResetToken = async (token) => {
  try {
    const userInfo = await db.one(
      "SELECT * FROM reset_tokens WHERE token = $1 AND expiration_time > NOW()",
      token
    );
    return userInfo;
  } catch (error) {
    return error;
  }
};

const updatePassword = async (password, userId) => {
  try {
    const userInfo = await db.one(
      "UPDATE users SET password = $1 WHERE id = $2",
      [ password, userId]
    );
    return userInfo;
  } catch (error) {
    return error;
  }
};

const deleteResetToken = async (token) => {
  try {
    const userInfo = await db.one(
      "DELETE FROM reset_tokens WHERE token = $1",
      token
    );
    return userInfo;
  } catch (error) {
    return error;
  }
};

module.exports = {
  insertResetToken,
  checkResetToken,
  updatePassword,
  deleteResetToken,
};
