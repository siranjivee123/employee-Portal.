const mg = require('../config/mailgun');

const sendWelcomeEmail = async (to, name, password) => {
  try {
    const response = await mg.messages.create(
      process.env.MAILGUN_DOMAIN,
      {
        from: `Admin <mailgun@${process.env.MAILGUN_DOMAIN}>`,
        to: [to],
        subject: "Welcome!",
        text: `Hello ${name},

Your account is created.

Email: ${to}
Password: ${password}

Please login and change your password.`
      }
    );

    console.log(" Email sent:", response);
  } catch (error) {
    console.log(" Mail error:", error.message);
  }
};

module.exports = { sendWelcomeEmail };