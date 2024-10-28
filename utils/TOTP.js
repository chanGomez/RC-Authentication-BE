const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const db = require("../db/db");
const { updateSecret } = require("../queries/authQueries");

async function registerTOTP(email) {
  const secret = speakeasy.generateSecret({ name: email, issuer: "auth" });

  // Validate the Base32 secret before storing
  if (!isValidBase32(secret.base32)) {
    return {
      status: false,
      message: "Generated TOTP secret is not valid Base32.",
    };
  }

  const updatedSecret = await updateSecret(secret.base32, email);
  if (!updatedSecret) {
    return {
      status: false,
      message: "Could not update the secret",
    };
  }

  const issuer = "auth";
  const otpauthURL = `otpauth://totp/${issuer}:${email}?secret=${secret.base32}&issuer=${issuer}`;

  const qrCode = await QRCode.toDataURL(otpauthURL);

  // Generate a TOTP token for the user
  const token = speakeasy.totp({
    secret: secret.base32,
    encoding: "base32",
  });


  return {
    qrCode,
    otpauthURL,
    manualKey: secret.base32,
    token, // Include the token in the return value
  };
}

function isValidBase32(str) {
  const base32Regex = /^[A-Z2-7]*$/;
  return base32Regex.test(str);
}

async function validateTOTP(email, token) {
  try {
    const user = (
      await db.query("SELECT * FROM users WHERE email = $1", [email])
    )[0];

    if (!user || !user.totp_secret) {
      return { message: "User not found or no TOTP secret registered." };
    }

    const isValid = speakeasy.totp.verify({
      secret: user.totp_secret,
      encoding: "base32",
      token: token,
      window: 5, // Tolerance for time drift
      algorithm: "sha1", // Ensure this matches your generation algorithm
    });

    const testingToken = speakeasy.totp({
      secret: user.totp_secret,
      encoding: "base32",
    });


    return isValid;
  } catch (err) {
    return { message: "TOTP validation failed", error: err };
  }
}

module.exports = { validateTOTP, registerTOTP };
