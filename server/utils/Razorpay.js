const Razorpay = require("razorpay");
const dotenv = require("dotenv");
const path = require("path");

if (!process.env.RAZORPAY_KEY_ID) {
  dotenv.config({ path: path.join(__dirname, "../.env") });
}

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.warn("WARNING: Razorpay credentials are missing in process.env");
  }

  return new Razorpay({
    key_id: key_id || "missing_key_id",
    key_secret: key_secret || "missing_key_secret",
  });
};

const razorpayInstance = getRazorpayInstance();

module.exports = razorpayInstance;
module.exports.getRazorpayInstance = getRazorpayInstance;