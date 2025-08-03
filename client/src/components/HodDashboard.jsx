// HodDashboard.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Welcome from '../components/HOD/Welcome';
import FacultyInfo from '../components/HOD/FacultyInfo';
import Publications from '../components/HOD/Publications';
import ExpertTalk from '../components/HOD/ExpertTalk';
import EventOrganized from '../components/HOD/EventOrganized';
import EventAttended from '../components/HOD/EventAttended';
// import RDProjects from '../components/HOD/RDProjects';
import ProjectPatentMoU from '../components/HOD/ProjectPatentMoU';
// import Patent from '../components/HOD/Patent';
import Student from '../components/HOD/Student';
import Faculty from '../components/HOD/Faculty';
import ConsultancyProject from '../components/HOD/ConsultancyProject';
import CentreActivity from '../components/HOD/CentreActivity';
import CurriculumDetails from '../components/HOD/CurriculumDetails';
import Newsletter from '../components/HOD/Newsletter';
import PaperReviews from '../components/HOD/PaperReviews';
import ResearchCentre from '../components/HOD/ResearchCentre';
import AnnualReport from '../components/HOD/AnnualReport';
import EditDetails from '../components/HOD/EditDetails';
import ReportGeneration from '../components/HOD/ReportGeneration';
import Navbar from './Navbar';
import {jwtDecode} from 'jwt-decode';

const HodDashboard = () => {
  const token = localStorage.getItem('token');
  const { email } = token ? jwtDecode(token) : {};

  return (
    <div style={{ display: 'flex', minHeight: '100vh' ,scrollY: 'hidden'}}>
      <div style={{ position:'fixed',top:0,left:0, width: '18vw' }}>
        <Sidebar />
      </div>
      <div className="main-content">
        <div className="hod-navbar">
          <Navbar />
        </div>
        <div className="hod-form-content">
          
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="faculty-info" element={<FacultyInfo />} />
          <Route path="publication" element={<Publications />} />
          <Route path="expert-talk" element={<ExpertTalk />} />
          <Route path="event-organized" element={<EventOrganized />} />
          <Route path="event-attended" element={<EventAttended />} />
          {/* <Route path="rd-projects" element={<RDProjects />} /> */}
          <Route path="project_patent_mou" element={<ProjectPatentMoU />} />
          {/* <Route path="patent" element={<Patent />} /> */}
          <Route path="student" element={<Student />} />
          <Route path="faculty" element={<Faculty />} />
          <Route path="consultancy-project" element={<ConsultancyProject />} />
          <Route path="centre-activity" element={<CentreActivity />} />
          <Route path="curriculum-details" element={<CurriculumDetails />} />
          <Route path="newsletter" element={<Newsletter />} />
          <Route path="paper-reviews" element={<PaperReviews />} />
          <Route path="research-centre" element={<ResearchCentre hodemail={email}/>} />
          <Route path="annual-report" element={<AnnualReport />} />
          <Route path="edit-details" element={<EditDetails />} />
          <Route path="report-generation" element={<ReportGeneration />} />
        </Routes>
        </div>
      </div>
    </div>
  );
};

export default HodDashboard;
