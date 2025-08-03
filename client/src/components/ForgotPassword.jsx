import React, { useState } from 'react';
import './ForgotPassword.css';
import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router-dom for navigation

const ForgotPassword = ( ) => {
    const navigate = useNavigate();

    const handleBack = () => {
      navigate(-1); // Go back to the previous page in history
    };

  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
    

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return alert('Please enter your LNMIIT email');
  
    try {
      const res = await fetch('http://localhost:5000/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        alert('OTP sent to your email');
      } else {
        alert(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error(err);
      alert('Server error sending OTP');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert('Passwords do not match!');
    if (!otp) return alert('Please enter OTP');
  
    try {
      const res = await fetch('http://localhost:5000/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
  
      const data = await res.json();
      if (data.success) {
        const res = await fetch('http://localhost:5000/api/otp/reset', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, newPassword }),
        });
        alert('Password reset successful!');
        handleBack();
      } else {
        alert(data.error || 'Failed to reset password');
      }
    } catch (err) {
      console.error(err);
      alert('Server error resetting password');
    }
  };
  
  return (
    <div className="forgot-password-container">
      <form className="forgot-password-form" onSubmit={otpSent ? handleResetPassword : handleSendOtp}>
        <h3>Forgot Password</h3 >

        <label>Email ID*</label>
        <input
          type="email"
          placeholder="yourid@lnmiit.ac.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={otpSent}
        />

        {otpSent && (
          <>
            <label>Enter OTP Received*</label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            <label>Enter New Password*</label>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              pattern="^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$"
              title="Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character (!@#$%^&*)"
            />

            <label>Confirm New Password*</label>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              pattern="^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$"
              title="Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character (!@#$%^&*)"
            />
          </>
        )}

        <button type="submit">{otpSent ? 'Reset Password' : 'Send OTP'}</button>
        {otpSent && (
          <button
            type="button"
            className="back-btn"
            onClick={handleBack}
          >
            Back to Login
          </button>
        )}
      </form>
    </div>
  );
};

export default ForgotPassword;
