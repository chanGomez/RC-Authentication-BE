const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const registerTOTP = (username) => {
  try {
    const secret = speakeasy.generateSecret({
      name: "TestApp (" + username + ")",
      issuer: "TestApp",
      algorithm: "sha1",
    });

    const user = getUserByUsername(username); 
    user.totpSecret = secret.base32; 
    saveUser(user);

    const otpauthURL = secret.otpauth_url; 
    return QRCode.toDataURL(otpauthURL)
      .then((qrCode) => {
        return {
          qrCode, 
          manualKey: secret.base32, 
        };
      })
      .catch((err) => {
        throw new Error("Failed to generate QR code");
      });
  } catch (err) {
    throw new Error("TOTP registration failed");
  }
};

const validateTOTP = (username, token) => {
  try {
    const user = getUserByUsername(username); 

    const isValid = speakeasy.totp.verify({
      secret: user.totpSecret, 
      encoding: "base32",
      token: token, 
      window: 2, 
      algorithm: "sha1",
    });

    if (isValid) {
      return { message: "TOTP token is valid" };
    } else {
      return { message: "Invalid TOTP token" };
    }
  } catch (err) {
    return { message: "TOTP validation failed" };
  }
};


    module.exports = { validateTOTP, registerTOTP}