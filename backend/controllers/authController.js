const bcrypt = require("bcryptjs");
const Employee = require("../models/Employee");
const generateToken = require("../utils/jwt");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await Employee.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    //  Generate token
    const token = generateToken(user);

    //  Response
    res.json({
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};