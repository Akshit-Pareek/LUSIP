import React from 'react';
import './FacultyDashboard.css';
import { Link, useLocation } from 'react-router-dom';
import Welcome from '../components/HOD/Welcome';
import ReportGeneration from '../components/HOD/ReportGeneration';
import { Routes, Route } from 'react-router-dom';

const FacultySidebar = () => {
    const location = useLocation();
    const department = location.state?.department;

    return (
        <div className="faculty-dashboard">
            
            <div style={{ flex: 1, padding: '20px' }}>
                <Routes>
                    <Route path="/w" element={<Welcome />} />
                    <Route path="report-generation" element={<ReportGeneration />} />
                </Routes>
                <header className="faculty-nav">
                    <h2>Faculty Dashboard</h2>
                    <nav className="faculty-tabs">
                        <li>
                            <Link to="/faculty/report-generation">Report Generation</Link>
                        </li>
                        {/* <Routes>
                    <Route path="report-generation" element={<ReportGeneration />} />
                    </Routes> */}
                    </nav>
                </header>
            </div>
        </div>
    );
};

export default FacultySidebar;
