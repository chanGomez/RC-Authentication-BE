const db = require("../db/db");

const getAllMovies = async () => {
  try {
    const allUsers = await db.any("SELECT * FROM movies");
    return allUsers;
  } catch (error) {
    return error;
  }
};

module.exports = {
  getAllMovies,
};
