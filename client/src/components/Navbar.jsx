import React from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear token
    navigate('/'); // Redirect to login/home
  };

  return (
    <div className="navbar">
      <div className="navbar-title">HOD Dashboard</div>
      <button className="logout-button" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Navbar;
