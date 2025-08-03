import React, { useState } from 'react';
import './Login.css';
import { jwtDecode } from 'jwt-decode'; // Make sure to install this package
import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router-dom for navigation
import { useEffect } from 'react';

const Login = ({ onSubmit }) => {
  const navigate = useNavigate(); // Assuming you're using react-router-dom for navigation

  useEffect(() => {
    localStorage.removeItem('token');
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        return alert(data.error);
      }

      // Store token
      localStorage.setItem('token', data.token);

      // Decode to get role
      const { department, role } = jwtDecode(data.token);

      // Redirect based on role
      if (role === 'HOD') {
        navigate('/hod', { state: { department } });
      } else if (role === 'HODOFFICE') {
        navigate('/hod-office', { state: { department } });
      } else {
        navigate('/faculty', { state: { department } });
      }
    } catch (err) {
      console.error('Login request failed', err);
      alert('Server error during login');
    }
    // onSubmit({ email, password });
  };

  return (
    <>
      <div className='header'>
        <div style={{ margin: 'auto', fontWeight: '500' }}>Academic Data Management System</div>
      </div>
      <div className="login-container">
        {/* <img className='backimg' src="/download.jpeg" alt="" /> */}
        <form className="login-form" onSubmit={handleSubmit}>
          <img className='logo' src=" https://lnmiit.ac.in/wp-content/uploads/2023/07/cropped-LNMIIT-Logo-Transperant-Background-e1699342125845.png " alt="no image" />
          {/* <img className='logo' src=" /LNMIIT-logo.jpg" alt="no image" /> */}

          <div className='form-ele'>
            <label>Email</label>
            <input
              type="email"
              placeholder="yourid@lnmiit.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              pattern="^[a-zA-Z0-9._%+\-]*@lnmiit\.ac\.in$"
              title="Email must start with a letter and end with @lnmiit.ac.in"
            />
          </div>
          <div className='form-ele'>
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              //change 6 to 8
              // pattern="^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$"
              title="Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character (!@#$%^&*)"
            />
          </div>
          <button type="submit" className="submit-btn">Login</button>
          <button type="button" className="forgot-password-btn" onClick={() => navigate('/forgot-password')}>
            Forgot Password?
          </button>
        </form>
      </div>
    </>
  );
};

export default Login;
