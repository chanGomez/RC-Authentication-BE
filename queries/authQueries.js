const db = require("../db/db");


const getUserByEmail = async (email) => {
  try {
    const userInfo = await db.one("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    return userInfo;
  } catch (error) {
    return error;
  }
};

const getUserByUsername = async (username) => {
  try {
    const userInfo = await db.one("SELECT * FROM users WHERE username=$1", [
      username,
    ]);
    return userInfo;
  } catch (error) {
    return error;
  }
};

const getUserById = async (id) => {
  try {
    const userInfo = await db.one("SELECT * FROM users WHERE id=$1", [
      id,
    ]);
    return userInfo;
  } catch (error) {
    return error;
  }
};

const createUser = async ({ username, email, hashedPassword }) => {
  try {
    const newUser = await db.any(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, hashedPassword]
    );
    return newUser;
  } catch (error) {
    return error;
  }
};

const updateSecret = async (totp_secret, email) => {
  try {
    const user = await db.one(
      "UPDATE users SET totp_secret = $1 WHERE email = $2 RETURNING *",
      [totp_secret, email]
    );
    return user;
  } catch (e) {
    return e;
  }

};

const blacklistToken = async (jwt_token) => {
  try {
    const insertToken = await db.any(
      "INSERT INTO token_blacklist (token) VALUES ($1)", 
      jwt_token
    );
    return insertToken;
  } catch (e) {
    return e;
  }
};

module.exports = {
  getUserByEmail,
  getUserByUsername,
  getUserById,
  createUser,
  updateSecret,
  blacklistToken,
};
