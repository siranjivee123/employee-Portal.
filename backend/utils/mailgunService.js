const formData = require("form-data");
const Mailgun = require("mailgun.js");

const mailgun = new Mailgun(formData);

const client = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
  url: "https://api.mailgun.net",
});

//   EMAIL SENDER
const sendEmail = async ({ to, subject, html }) => {
  try {
    return await client.messages.create(process.env.MAILGUN_DOMAIN, {
      from: "HR Team <hr@yourdomain.com>",
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("MAILGUN ERROR:", err);
    throw err;
  }
};

// APPROVAL EMAIL
const sendLeaveApprovalEmail = (email, leave) => {
  return sendEmail({
    to: email,
    subject: "Leave Approved ",
    html: `
      <p>Dear Employee,</p>

      <p>Your leave request has been <b style="color:green;">APPROVED</b>.</p>

      <p><b>From:</b> ${new Date(leave.fromDate).toDateString()}</p>
      <p><b>To:</b> ${new Date(leave.toDate).toDateString()}</p>

      <br/>
      <p>Regards,<br/>ADMIN Team</p>
    `,
  });
};

//  REJECTION EMAIL
const sendLeaveRejectionEmail = (email, leave) => {
  return sendEmail({
    to: email,
    subject: "Leave Rejected ",
    html: `
      <p>Dear Employee,</p>

      <p>Your leave request has been <b style="color:red;">REJECTED</b>.</p>

      <p><b>From:</b> ${new Date(leave.fromDate).toDateString()}</p>
      <p><b>To:</b> ${new Date(leave.toDate).toDateString()}</p>

      <p><b>Reason:</b> ${leave.denialReason || "Not provided"}</p>

      <br/>
      <p>Regards,<br/>HR Team</p>
    `,
  });
};

module.exports = {
  sendLeaveApprovalEmail,
  sendLeaveRejectionEmail,
};