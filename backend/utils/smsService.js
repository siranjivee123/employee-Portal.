/*const twilio = require('twilio');
const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

let otpStore = {};

exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const phone = user.phone; 

    //  6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save OTP
    otpStore[email] = otp;

    // Send SMS 
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: phone
    });

    res.json({ message: 'OTP sent to mobile number' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
};

// VERIFY
exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] == otp) {
    res.json({ success: true });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
};


//RESET
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    await User.updateOne(
      { email },
      { password: newPassword }
    );

    res.json({ message: 'Password updated successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Error updating password' });
  }
};*/

const twilio = require("twilio");
const bcrypt = require("bcryptjs");
const Employee = require("../models/Employee");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

let otpStore = {};
// SEND OTP
exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Employee.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.phone) {
      return res.status(400).json({ message: "Phone number not found" });
    }

    // OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    await client.messages.create({
      body: `Your OTP for password reset is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${user.phone}`   // India format
    });

    res.json({ message: "OTP sent via SMS" });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error sending OTP",
      error: error.message
    });
  }
};


// VERIFY OTP
exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  const record = otpStore[email];

  if (!record) {
    return res.status(400).json({ message: "OTP not found" });
  }

  if (Date.now() > record.expires) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP expired" });
  }

  if (Number(otp) !== record.otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  res.json({ success: true });
};
//RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const record = otpStore[email];

    if (!record) {
      return res.status(400).json({ message: "OTP not verified" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await Employee.findOneAndUpdate(
      { email },
      { password: hashed }
    );

    delete otpStore[email];

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating password" });
  }
};