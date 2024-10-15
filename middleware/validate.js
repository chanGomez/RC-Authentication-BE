function validatePassword(req, res, next) {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }
  const isLongEnough = /.{8,}/; // At least 8 characters
  const hasUpperCase = /[A-Z]/; // At least one uppercase letter
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/; // At least one special character
  const hasNumber = /\d/; // At least one number

  // Perform checks
  if (!isLongEnough.test(password)) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters long" });
  }
  if (!hasUpperCase.test(password)) {
    return res
      .status(400)
      .json({ error: "Password must contain at least one uppercase letter" });
  }
  if (!hasSpecialChar.test(password)) {
    return res
      .status(400)
      .json({ error: "Password must contain at least one special character" });
  }
  if (!hasNumber.test(password)) {
    return res
      .status(400)
      .json({ error: "Password must contain at least one number" });
  }
  next();
}

function validateEmail(req, res, next) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  // Regular expression for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  next();
}

function validateUsername(req, res, next) {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  const usernameRegex = /^[a-zA-Z0-9]+$/;

  if (!usernameRegex.test(username)) {
    return res
      .status(400)
      .json({
        error:
          "Username can only contain letters and numbers with no spaces or special characters",
      });
  }
  next();
}

module.exports = { validatePassword, validateEmail, validateUsername };
