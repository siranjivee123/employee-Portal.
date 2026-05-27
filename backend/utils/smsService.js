const twilio = require('twilio');
const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

let otpStore = {};

exports.sendOtp = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findOne({ employeeId: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const phone = user.phone; 

    //  6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save OTP
    otpStore[userId] = otp;

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
  const { userId, otp } = req.body;

  if (otpStore[userId] == otp) {
    res.json({ success: true });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
};


//RESET
exports.resetPassword = async (req, res) => {
  const { userId, newPassword } = req.body;

  try {
    await User.updateOne(
      { employeeId: userId },
      { password: newPassword }
    );

    res.json({ message: 'Password updated successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Error updating password' });
  }
};