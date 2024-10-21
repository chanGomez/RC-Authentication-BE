const db = require("../db/db");
const updateSecret = async (totpSecret, email) => {
  try {
    const user = await db.one(
      "UPDATE users SET totpSecret = $1 WHERE email = $2 RETURNING *",
      [totpSecret, email]
    );
    return user;
  } catch (e) {
    return e;
  }
};
module.exports = {
  updateSecret,
};
