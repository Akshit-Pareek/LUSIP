import React, { useState } from 'react';
import './CurriculumDetails.css';

const departments = {
  CSE: [
    { 'name': 'B.Tech. in Computer Science and Engineering', 'download': 'https://lnmiit.ac.in/uploaded_files/Y23_BTech_CSE.pdf' },
    { 'name': 'B.Tech. (Honours) in CSE with specialization in Artificial Intelligence & Data Science', 'download': 'https://lnmiit.ac.in/uploaded_files/Y23_BTech_CSE.pdf' },
    { 'name': 'B.Tech. - M.Tech. Integrated Degree in Computer Science and Engineering', 'download': 'https://lnmiit.ac.in/uploaded_files/Y23_BTech_CSE_Integrated.pdf' },
    { 'name': 'M.Tech. in Computer Science and Engineering', 'download': 'https://lnmiit.ac.in/uploaded_files/M.Tech_CSE_2024_onwards.pdf' },
    { 'name': 'M.Tech. in CSE with specialization in Cybersecurity', 'download': 'https://lnmiit.ac.in/uploaded_files/M.Tech_CSE_2024_onwards.pdf' },
    { 'name': 'M.Tech. in CSE with specialization in AI & ML', 'download': 'https://lnmiit.ac.in/uploaded_files/M.Tech_CSE_2024_onwards.pdf' },
    { 'name': 'M.S. by Research in CSE', 'download': 'https://lnmiit.ac.in/department/cse/programs/' },
    { 'name': 'PhD Manual', 'download': 'https://lnmiit.ac.in/department/cse/programs/' },
  ],
  CCE: [
    { 'name': 'B.Tech. in Communication and Computer Engineering', 'download': 'https://lnmiit.ac.in/uploaded_files/Y23_BTech_CCE.pdf' },
    { 'name': 'B.Tech. (Honours) in CCE with specialization in Artificial Intelligence & Data Science', 'download': 'https://lnmiit.ac.in/department/cce/programs/#:~:text=Programme%20Info-,B.Tech.%20(Honours)%20In%20Communication%20and%20Computer%20Engineering%20(CCE)%20with%20specialization%20in%20Artificial%20Intelligence%20%26%20Data%20Science,-Programme%20Curriculum' },
    { 'name': 'M.S. by Research in CCE', 'download': 'https://lnmiit.ac.in/department/cce/programs/#:~:text=Programme%20Info-,M.S.%20(by%20Research)%20in%20Communication%20and%20Computer%20Engineering%20(CCE),-Programme%20Outcome' },
    { 'name': 'PhD Manual', 'download': 'https://lnmiit.ac.in/department/cce/programs/#:~:text=Programme%20Curriculum-,Ph.D.,-Major%20Research%20Areas' },
  ],
  ECE: [
    { 'name': 'B.Tech. in Electronics and Communication Engineering', 'download': 'https://lnmiit.ac.in/uploaded_files/Y23_BTech_ECE.pdf' },
    { 'name': 'B.Tech. - M.Tech. Integrated Degree in Electronics and Communication Engineering', 'download': 'https://lnmiit.ac.in/uploaded_files/Y23_BTech_ECE_Integrated.pdf' },
    { 'name': 'M.Tech. in Electronics and Communication Engineering', 'download': 'https://lnmiit.ac.in/uploaded_files/M_Tech_ECE_Curriculum_22042025.pdf' },
    { 'name': 'M.S. by Research in ECE', 'download': 'https://lnmiit.ac.in/uploaded_files/MS-by-Research-Curriculum-ECE-23042025.pdf' },
    { 'name': 'PhD Manual', 'download': 'https://lnmiit.ac.in/department/ece/programs/#:~:text=and%20Communication%20Engineering-,Ph.D.%20Program,-Ph.D.%20Program' },
  ],
  MME: [
    { 'name': 'B.Tech. in Mechanical Engineering', 'download': 'https://lnmiit.ac.in/uploaded_files/Y23_BTech_ME.pdf' },
    { 'name': 'B.Tech. (Honours) in ME with specialization in Robotics & Automation', 'download': 'https://lnmiit.ac.in/uploaded_files/Y23_BTech_ME-(Hons)-with-Specialization-in-Robotics-and-Automation.pdf' },
    { 'name': 'B.Tech. in Mechanical Engineering for Working Professionals', 'download': 'https://lnmiit.ac.in/uploaded_files/Y23_BTech_ME.pdf' },
    { 'name': 'PhD Manual', 'download': 'https://lnmiit.ac.in/uploaded_files/Y23_BTech_ME-(Hons)-with-Specialization-in-Robotics-and-Automation.pdf' },
  ],
  Mathematics: [{ 'name': 'M.Sc. in Mathematics and Computing', 'download': 'https://lnmiit.ac.in/uploaded_files/MSc-Mathematics-and-Computing-Curriculum.pdf' }, { 'name': 'PhD Manual', 'download': 'https://lnmiit.ac.in/department/math/programs/#:~:text=Financial%20Support%3A-,Ph.D%20Mathematics,-Introduction' }],
  Physics: [{ 'name': 'M.Sc. in Physics', 'download': 'https://lnmiit.ac.in/uploaded_files/Physics-MSc-Curriculum.pdf' }, { 'name': 'PhD Manual', 'download': 'https://lnmiit.ac.in/department/math/programs/#:~:text=Financial%20Support%3A-,Ph.D%20Mathematics,-Introduction' }],
  HSS: [{ 'name': 'PhD Manual', 'download': 'https://lnmiit.ac.in/department/hss/programs/#:~:text=HSS4142-,Ph.D.%20Programme,-Name%20of%20the' }],
};

const CurriculumDetails = () => {
  const [view, setView] = useState('curriculum');
  const [selectedDept, setSelectedDept] = useState('');
  //   const [courseType, setCourseType] = useState('Program Core');
  //   const [courseLevel, setCourseLevel] = useState('Level 1');
  //   const [courses, setCourses] = useState([]);
  const [courseType, setCourseType] = useState('Select');
  const [courseYear, setCourseYear] = useState('Select');

  const coursesData = {
    'Program Core': {
      'Level 1': [
        { name: 'Course A1', abbreviation: 'CA1', code: 'PC101', downloadUrl: '/files/pc101.pdf' },
        { name: 'Course A2', abbreviation: 'CA2', code: 'PC102', downloadUrl: '/files/pc102.pdf' },
      ],
      'Level 2': [
        { name: 'Course B1', abbreviation: 'CB1', code: 'PC201', downloadUrl: '/files/pc201.pdf' },
      ],
    },
    'Program Elective': {
      'Level 1': [
        { name: 'Elective A1', abbreviation: 'EA1', code: 'PE101', downloadUrl: '/files/pe101.pdf' },
      ],
      'Level 3': [
        { name: 'Elective B1', abbreviation: 'EB1', code: 'PE301', downloadUrl: '/files/pe301.pdf' },
      ],
    },
    'Open Elective': {
      'Level 1': [
        { name: 'Open Elective A1', abbreviation: 'OE1', code: 'OE101', downloadUrl: '/files/oe101.pdf' },
      ],
    },
  };

  // Get courses list based on selections or empty array if none
  const courses = (coursesData[courseType] && coursesData[courseType][courseYear]) || [];

  return (
    <div className="curriculum-cif">
      <div className="toggle-buttons">
        <button onClick={() => setView('curriculum')} className={view === 'curriculum' ? 'active' : ''}>Curriculum</button>
        <button onClick={() => setView('cif')} className={view === 'cif' ? 'active' : ''}>CIF</button>
      </div>

      {view === 'curriculum' && (
        <>
          <div className="dept">
            <label>Department:</label>
            <select onChange={(e) => setSelectedDept(e.target.value)} value={selectedDept}>
              <option value="">Select</option>
              {Object.keys(departments).map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </div>

          {selectedDept && (
            <div className="programs-list">
              <table className="cif-table">
                <thead>
                  <tr>
                    <th style={{ fontWeight: '600', textAlign: 'center' }}>Program</th>
                    <th style={{ fontWeight: '600', textAlign: 'center' }}>Download Links</th>
                  </tr>
                </thead>
                <tbody>
                  {departments[selectedDept].length === 0 ? (
                    <tr><td colSpan="2">No Programs found for selected Department.</td></tr>
                  ) : (
                    departments[selectedDept].map((prog, i) => (
                      <tr key={i}>
                        <td>{prog.name}</td>
                        <td style={{ textAlign: 'center' }}>
                          <a href={prog.download} download target="_blank" rel="noopener noreferrer">
                            <img width={'25px'} height={'25px'} src="/download.png" alt="no image found" />
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {view === 'cif' && (
        <>
          {/* <h2>CIF Section</h2> */}

          <label >
            Course Type:
            <select style={{ marginLeft: '10px', padding: '5px' }} value={courseType} onChange={e => setCourseType(e.target.value)}>
              <option>Select</option>
              <option value='Program Core'>Program Core</option>
              <option value='Program Elective'>Program Elective</option>
              <option value='Open Elective'>Open Elective</option>
            </select>
          </label>

          <label>
            Course Year:
            <select style={{ marginLeft: '14px', padding: '5px' }} value={courseYear} onChange={e => setCourseYear(e.target.value)}>
              <option value=''>Select</option>
              <option value='Level 1'>Level 1</option>
              <option value='Level 2'>Level 2</option>
              <option value='Level 3'>Level 3</option>
              <option value='Level 4'>Level 4</option>
              <option value='Level 5'>Level 5</option>
              <option value='Level 6'>Level 6</option>
              <option value='Level 7'>Level 7</option>
            </select>
          </label>

          <table className="cif-table">
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Abbreviation</th>
                <th>Course Code</th>
                <th>Download CIF</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr><td colSpan="4">No courses found for selected type and year.</td></tr>
              ) : (
                courses.map((course, idx) => (
                  <tr key={idx}>
                    <td>{course.name}</td>
                    <td style={{ textAlign: 'center' }}>{course.abbreviation}</td>
                    <td style={{ textAlign: 'center' }}>{course.code}</td>
                    <td style={{ textAlign: 'center' }}>
                      <a style={{ fontWeight: '600' }} href={course.downloadUrl} download target="_blank" rel="noopener noreferrer">
                        <img width={'25px'} height={'25px'} src="/download.png" alt="no image found" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default CurriculumDetails;
