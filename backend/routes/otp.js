// routes/otp.js
const { hash } = require('bcrypt');
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const pool = require('../db');

const otps = {}; // For dev/testing; use Redis or DB in production

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Route to send OTP
router.post('/send', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  transporter.verify((error, success) => {
    if (error) {
      console.log('SMTP connection error:', error);
    } else {
      console.log('SMTP server is ready to take our messages');
    }
  });
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}`,
    });

    otps[email] = otp;
    console.log(`OTP sent to ${email}: ${otp}`);
    return res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    // res.status(500).json({ error: 'Failed to send OTP' });
    return res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
});

// Route to verify OTP
router.post('/verify', async (req, res) => {
  const { email, otp,newPassword } = req.body;
  try{
    if (otps[email] === otp) {
      delete otps[email]; // Clear OTP after success
      return res.status(200).json({ success: true,message: 'OTP verified successfully' });
    } else {
      return res.status(400).json({success: false, error: 'Invalid or expired OTP' });
    }
  } catch (err) {
    console.error('Error verifying OTP:', err);
    return res.status(500).json({ success: false, error: 'Internal servor error' });
  }
});

// Route to reset password
router.put('/reset', async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const hashedPassword = await hash(newPassword, 10);
    // Update password in the database
    await pool.query('UPDATE faculty SET password = ? WHERE email = ?', [hashedPassword, email]);
    return res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error('Error resetting password:', err);
    return res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
});

module.exports = router;
