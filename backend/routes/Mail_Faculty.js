const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendCredentialsMail = async (to, name, tempPassword) => {
  const mailOptions = {
    from: `"Academic Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Faculty Portal Login Credentials',
    html: `
      <div style="background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 800px; margin: auto; background: #ffffff; padding: 30px; font-family: Arial, sans-serif; font-size: 14px; color: #000;">
          <p>Dear ${name},</p>

          <p>You have been added to the Faculty Information Management System at <strong>The LNM Institute of Information Technology, Jaipur</strong>.</p>

          <p><strong>Your temporary login credentials are as follows:</strong></p>

          <ul>
            <li><strong>Login Email:</strong> ${to}</li>
            <li><strong>Temporary Password:</strong> ${tempPassword}</li>
          </ul>

          <p>Please use the above credentials to login to the Faculty Portal. You are strongly advised to change your password after the first login for security reasons.</p>

          <p>When creating your new password, please ensure:</p>
          <ul>
            <li>Do not use your entire name or any part of it.</li>
            <li>Minimum password length: 8 characters.</li>
            <li>Your password must include at least one of each of the following:
              <ul>
                <li>Uppercase Letter: [A-Z]</li>
                <li>Lowercase Letter: [a-z]</li>
                <li>Digit: [0-9]</li>
                <li>Special Characters: [@, ., _, +, #, $, %, &, *, (, )]</li>
              </ul>
            </li>
          </ul>

          <p>Thank you for your attention to this matter. If you have any questions or need further assistance, please do not hesitate to contact us.</p>

          <br>
          <p>Best Regards,<br>
          Academic Portal Team<br>
          The LNM Institute of Information Technology, Jaipur</p>

          <hr style="border: none; border-top: 1px solid #ccc;">
          <p style="color: gray; font-size: 12px;">This is a system-generated mail. Please do not reply.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
module.exports = { sendCredentialsMail };