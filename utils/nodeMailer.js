const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function createResetPasswordEmail(email, resetUrl) {
  return{
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
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
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Someone tried to login to your account.",
    html: `
        <p>There were multiple failed login attempts to your account.</p>
        <p>If this was not you, please reset your password immediately.</p>
        <p>If it was you, please ignore this email.</p>
      `,
  };
}
module.exports = { transporter, createResetPasswordEmail, lockedOutEmail };
