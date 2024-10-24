const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.email",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function createResetPasswordEmail(email, resetUrl) {
  return {
    from: {
      name: "authentication app",
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: "Password Reset Request",
    text: "Reset password email",
    html: `
        <p>You requested a password reset</p>
        <p>Click this <a href="${resetUrl}">link</a> to reset your password</p>
        <p>This link will expire in 15 minutes.</p>
        <p>If did not request a password reset, please ignore this email.</p>
      `,
  };
}

function lockedOutEmail(email) {
  return {
    from: {
      name: "authentication app",
      address: process.env.EMAIL_USER,
    },
    to: email,
    subject: "Someone tried to login to your account.",
    text: "Multiple failed log in attempts.",
    html: `
        <p>There were multiple failed login attempts to your account.</p>
        <p>If this was not you, please reset your password immediately.</p>
        <p>If it was you, please ignore this email.</p>
      `,
  };
}

function newBrowserAlert(email) {
  return {
    from: {
      name: "authentication app",
      address: process.env.EMAIL_USER,
    },
    to: email,
    subject: "Someone tried to login to your account.",
    text: "Unknown IP address, account logged in at another location.",
    html: `
        <p>Your account was logged in from a new IP address. Was this you?</p>
        <p>If this was not you, please reset your password immediately.</p>
        <p>If it was you, please ignore this email.</p>
      `,
  };
}
module.exports = {
  transporter,
  createResetPasswordEmail,
  lockedOutEmail,
  newBrowserAlert,
};
