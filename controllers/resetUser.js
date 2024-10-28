const express = require("express");
const router = express.Router();

const { deleteUserFromCypress } = require("../queries/authQueries");

//route made to delete a user created by the cypress testing!!
router.post("/reset-user", async (req, res) => {
  const { email } = req.body;
  try {
    const foundUserByEmail = await deleteUserFromCypress(email);

    return res
      .status(200)
      .json({ message: "User removed for testing.", data: foundUserByEmail });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging out", error: error.message });
  }
});

module.exports = router;
