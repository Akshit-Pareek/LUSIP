import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import HodDashboard from './components/HodDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import ProtectedRoute from './components/ProtectedRoute';
// Optional: use a config file or env variable
const BASE_URL = 'http://localhost:5000'; // your backend server

function App() {
  
  return (
    // <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/hod/*" element={<ProtectedRoute allowedRoles={['HOD']}><HodDashboard /></ProtectedRoute>} />
        <Route path="/hod-office" element={<ProtectedRoute allowedRoles={['HODOFFICE']}><HodDashboard /></ProtectedRoute>} />
        <Route path="/faculty" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />

        {/* <Route path="/hod-office/*" element={<HodDashboard />} /> */}
      </Routes>
    // </Router>
  );
}

export default App;
