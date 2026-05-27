const formData = require("form-data");
const Mailgun = require("mailgun.js");

const mailgun = new Mailgun(formData);

const client = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
  url: "https://api.mailgun.net",
});

const sendWelcomeEmail = async (email, tempPassword, name, employeeId) => {
  try {

    console.log("EMAIL DATA:", { email, tempPassword, name, employeeId });

    const messageData = {
      from: "HR Team <postmaster@sandbox36cc42261ee847b887f1f02571abc580.mailgun.org>",
      to: email, 
      subject: "Welcome to the Company",

      html: `
<p>Hello <strong>${name}</strong>,</p>

<p>Welcome to our company!</p>

<p>Your employee account has been created successfully.</p>

<p><strong>Login Details:</strong></p>

<p><strong>Email:</strong> ${email}</p>
<p><strong>Employee ID:</strong> ${employeeId}</p>
<p><strong>Temporary Password:</strong> ${tempPassword}</p>

<p>Please login and change your password after first login.</p>

<p>Thank you,<br/>HR Team</p>
      `,
    };

    const response = await client.messages.create(
      process.env.MAILGUN_DOMAIN,
      messageData
    );

    console.log(" MAIL SENT:", response);

    return response;

  } catch (error) {
    console.error("MAIL ERROR:", error);
    throw error;
  }
};

module.exports = { sendWelcomeEmail };