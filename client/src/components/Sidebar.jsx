// Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  return (
    <div className={`sidebar`}>
      <div className="head">Welcome</div>
      {(
        <ul>
          <li className={location.pathname === '/hod/faculty-info' ? 'active' : ''}>
            <Link to="/hod/faculty-info">Faculty Information</Link>
          </li>
          <li className={location.pathname === '/hod/publication' ? 'active' : ''}>
            <Link to="/hod/publication">Publication</Link>
          </li>
          <li className={location.pathname === '/hod/expert-talk' ? 'active' : ''}>
            <Link to="/hod/expert-talk">Expert Talk</Link>
          </li>
          <li className={location.pathname === '/hod/event-attended' ? 'active' : ''}>
            <Link to="/hod/event-attended">Event Attended</Link>
          </li>
          <li className={location.pathname === '/hod/event-organized' ? 'active' : ''}>
            <Link to="/hod/event-organized">Event Organized</Link>
          </li>
          <li className={location.pathname === '/hod/student' ? 'active' : ''}>
            <Link to="/hod/student">Student</Link>
          </li>
          <li className={location.pathname === '/hod/faculty' ? 'active' : ''}>
            <Link to="/hod/faculty">Faculty</Link>
          </li>
          <li className={location.pathname === '/hod/project_patent_mou' ? 'active' : ''}>
            <Link to="/hod/project_patent_mou">Project, Patent, MoU</Link>
          </li>
          <li className={location.pathname === '/hod/paper-reviews' ? 'active' : ''}>
            <Link to="/hod/paper-reviews">Paper Reviews</Link>
          </li>
          <li className={location.pathname === '/hod/curriculum-details' ? 'active' : ''}>
            <Link to="/hod/curriculum-details">Curriculum</Link>
          </li>
          <li className={location.pathname === '/hod/research-centre' ? 'active' : ''}>
            <Link to="/hod/research-centre">Research Centre</Link>
          </li>
          <li className={location.pathname === '/hod/annual-report' ? 'active' : ''}>
            <Link to="/hod/annual-report">Annual Report</Link>
          </li>
          <li className={location.pathname === '/hod/edit-details' ? 'active' : ''}>
            <Link to="/hod/edit-details">Edit Details</Link>
          </li>
          <li className={location.pathname === '/hod/report-generation' ? 'active' : ''}>
            <Link to="/hod/report-generation">Report Generation</Link>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
