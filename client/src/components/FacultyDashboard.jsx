import React from 'react';
import './FacultyDashboard.css';
import { Link, useLocation } from 'react-router-dom';
import Welcome from '../components/HOD/Welcome';
import ReportGeneration from '../components/HOD/ReportGeneration';
import Sidebar from './FacultySidebar';
import { Routes, Route } from 'react-router-dom';

const FacultyDashboard = () => {
    const location = useLocation();
    const department = location.state?.department || 'your department';

    return (
        <div className="faculty-dashboard">
            <div style={{ width: '250px' }}>
        <Sidebar />
      </div>
            <div style={{ flex: 1, padding: '20px' }}>
                <Routes>
                    <Route path="/w" element={<Welcome />} />
                    <Route path="report-generation" element={<ReportGeneration />} />
                </Routes>
            </div>
        </div>
    );
};

export default FacultyDashboard;
