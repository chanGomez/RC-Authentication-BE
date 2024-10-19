const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const db = require("../db/db.js");

async function registerTOTP(email) {
  const secret = speakeasy.generateSecret({ name: email, issuer: "auth" });
  console.log("Generated TOTP Secret:", secret.base32);

  // Validate the Base32 secret before storing
  if (!isValidBase32(secret.base32)) {
    throw new Error("Generated TOTP secret is not valid Base32.");
  }

  const updateSecret = "UPDATE users SET totpSecret = $1 WHERE email = $2";
  await db.query(updateSecret, [secret.base32, email]);

  // Generate the otpauth URL for QR code
  const otpauthURL = secret.otpauth_url;
  const qrCode = await QRCode.toDataURL(otpauthURL);

  return {
    qrCode,
    manualKey: secret.base32,
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
    ).rows[0];

    if (!user || !user.totpSecret) {
      return { message: "User not found or no TOTP secret registered." };
    }

    const isValid = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: "base32",
      token: token,
      window: 1, // Small window for extra tolerance
      algorithm: "sha1", // Make sure this matches your secret generation
    });

    return isValid
      ? { message: "TOTP token is valid" }
      : { message: "Invalid TOTP token" };
  } catch (err) {
    console.log(err);
    return { message: "TOTP validation failed", error: err };
  }
}


module.exports = { validateTOTP, registerTOTP };

//secret looks like this
// {
//   ascii: 'FTgbWTo[>hiS2R!@tl&PJLTElTD0?Q]a',
//   hex: '4654676257546f5b3e68695332522140746c26504a4c54456c5444303f515d61',
//   base32: 'IZKGOYSXKRXVWPTINFJTEURBIB2GYJSQJJGFIRLMKRCDAP2RLVQQ',
//   otpauth_url: 'otpauth://totp/test2%40gmail.com?secret=IZKGOYSXKRXVWPTINFJTEURBIB2GYJSQJJGFIRLMKRCDAP2RLVQQ'
// }

//final data
// {
//     "message": "TOTP setup successful",
//  "qrCode": ":image/png;base64,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",
//     "manualKey": "MV5X23KDFFTDANCVINECGM23OZ4VUTSJNVXUC3RJIVSDYR2REUUQ"
// }

module.exports = { validateTOTP, registerTOTP };


// 6 | okokaoka | chantytueday@gmail.com | $2b$10$KWttjHBGak1KrUE5PQ4q9OBJ5T116VdB/4ZeLUpw48auMsBVPK0Ei | MRMDAOBILMZFE32CIFEUKOJJLVHHE2JMJR2V233PGVUGS6JBPMTA