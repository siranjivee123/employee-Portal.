const express = require('express');
const router = express.Router();
const Employee = require("../models/Employee");
const jwt = require('jsonwebtoken');
const axios = require('axios');
const twilio = require("twilio");
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);


// OTP store
const otpStore = {};

const normalizeUserId = (id) => id?.trim().toLowerCase();
/* LOGIN API */
router.post('/login', async (req, res) => {
  try {
    const { email, password, captcha } = req.body;

    // CAPTCHA VERIFY
    const verify = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captcha
        }
      }
    );
    console.log("LOGIN BODY:", req.body);
console.log("CAPTCHA RESULT:", verify.data);

    if (!verify.data.success) {
      return res.status(400).json({ message: "Captcha failed" });
    }

//ADMIN LOGIN:

    if (email === "admin@company.com" && password === "admin123") {
      const token = jwt.sign(
        { role: "admin", email },
        process.env.JWT_SECRET,
        { expiresIn: '20m' }
      );

      return res.json({
        token,
        role: "admin",
        employeeId: "ADMIN",
        userName: "Admin"
      });
    }

   // EMP AND MANAGER LOGIN
    const Employee = require("../models/Employee");

    const user = await Employee.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const bcrypt = require("bcryptjs");
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '20m' }
    );

    return res.json({
      token,
      role: user.role,
      employeeId: user._id,
      userName: user.name
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
/*SEND OTP*/
router.post('/send-otp', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    const user = await Employee.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${user.phone}`
    });

    console.log("OTP SENT:", otp);

    res.json({ message: 'OTP sent successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

/*  VERIFY OTP*/
router.post('/verify-otp', (req, res) => {
  const email = req.body.email?.trim().toLowerCase();

  const record = otpStore[email];

  if (!record) return res.status(400).json({ message: 'OTP not found' });

  if (Date.now() > record.expires) {
    delete otpStore[email];
    return res.status(400).json({ message: 'OTP expired' });
  }

  if (Number(req.body.otp) !== record.otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  res.json({ message: 'OTP verified' });
});
/*  RESET PASSWORD */
const bcrypt = require("bcryptjs");

router.post('/reset-password', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const newPassword = req.body.newPassword;

    const record = otpStore[email];

    if (!record) {
      return res.status(400).json({ message: "OTP not verified or expired" });
    }

    if (Date.now() > record.expires) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Employee.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    );

    delete otpStore[email];

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;


