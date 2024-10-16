const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "delfina.jacobson@ethereal.email",
    pass: "m9VPxMVnGDzsV7JKSX",
  },
});

function createResetPasswordEmail(email, resetUrl) {
  return {
    from: "delfina.jacobson@ethereal.email",
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
    from: "delfina.jacobson@ethereal.email",
    to: email,
    subject: "Someone tried to login to your account.",
    html: `
        <p>There were multiple failed login attempts to your account.</p>
        <p>If this was not you, please reset your password immediately.</p>
        <p>If it was you, please ignore this email.</p>
      `,
  };
}

function newBrowserAlert(email) {
  return {
    from: "delfina.jacobson@ethereal.email",
    to: email,
    subject: "Someone tried to login to your account.",
    html: `
        <p>There were multiple failed login attempts to your account.</p>
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
