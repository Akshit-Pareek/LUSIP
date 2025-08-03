import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Student.css';

const BTPDetails = ({ editData }) => {
  const [yearOptions, setYearOptions] = useState([]);
  const navigate = useNavigate();
  const isEditing = !!editData;
  const [certificateURL, setCertificateURL] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    students: [
      { firstName: '', middleName: '', lastName: '', rollNo: '', department: 'CSE' }
    ],
    supervisors: [
      { salutation: '', firstName: '', middleName: '', lastName: '', designation: '', department: 'CSE' }
    ],
    certificate: null,
    year: '',
  });

  useEffect(() => {
    const generateAcademicYears = () => {
      const startYear = 2002;
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      const endYear = currentMonth >= 7 ? currentYear + 1 : currentYear;

      const years = [];
      for (let y = startYear; y < endYear; y++) {
        years.push(`${y}-${(y + 1).toString().slice(2)}`);
      }
      setYearOptions(years.reverse());
    };
    generateAcademicYears();

    if (editData) {
      setFormData({
        title: editData.title || '',
        students: editData.students.map(c => ({
          firstName: c.firstName || '',
          middleName: c.middleName || '',
          lastName: c.lastName || '',
          rollNo: c.rollNo || '',
          department: c.department || 'CSE'
        })) || [
            { firstName: '', middleName: '', lastName: '', rollNo: '', department: 'CSE' }
          ],
        supervisors: editData.supervisors.map(c => ({
          salutation: c.salutation || '',
          firstName: c.firstName || '',
          middleName: c.middleName || '',
          lastName: c.lastName || '',
          designation: c.designation || '',
          department: c.department || 'CSE',
        })) || [
            { salutation: '', firstName: '', middleName: '', lastName: '', designation: '', department: 'CSE' }
          ],
        certificate: null,
        year: editData.year || ''
      });

      if (editData.certificate_path) {
        const relativePath = editData.certificate_path.split('\\').pop(); // replace Windows backslashes
        const encodedPath = encodeURIComponent(relativePath);
        setCertificateURL(`http://localhost:5000/uploads/BTPDetails/${encodedPath}`);
        console.log('Certificate URL:', `http://localhost:5000/uploads/BTPDetails/${encodedPath}`);
      }
      else {
        setCertificateURL(null);
      }
    }
  }, [editData]);

  // Handle title & certificate
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'certificate') {
      setFormData({ ...formData, certificate: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle dynamic student updates
  const handleStudentChange = (index, e) => {
    const { name, value } = e.target;
    const updatedStudents = [...formData.students];
    updatedStudents[index][name] = value;
    setFormData({ ...formData, students: updatedStudents });
  };

  const addStudent = () => {
    setFormData({
      ...formData,
      students: [...formData.students, { firstName: '', middleName: '', lastName: '', rollNo: '', department: '' }]
    });
  };

  // Handle supervisor updates
  const handleSupervisorChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...formData.supervisors];
    updated[index][name] = value;
    setFormData({ ...formData, supervisors: updated });
  };

  const addSupervisor = () => {
    setFormData({
      ...formData,
      supervisors: [...formData.supervisors, { salutation: '', firstName: '', middleName: '', lastName: '', designation: '', department: '' }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('title', formData.title);
    form.append('students', JSON.stringify(formData.students));
    form.append('supervisors', JSON.stringify(formData.supervisors));
    form.append('year', formData.year);
    if (formData.certificate) {
      form.append('certificate', formData.certificate);
    }

    try {
      const url = isEditing
        ? `http://localhost:5000/api/btp-details/${editData.id}`
        : `http://localhost:5000/api/btp-details`;
      const method = isEditing ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method: method,
        body: form,
      });

      if (!response.ok) {
        throw new Error('Network error');
      }

      alert('BTP Details submitted successfully!');
      navigate('/hod/student');
      setCertificateURL(null);
      setFormData({
        title: '',
        students: [
          { firstName: '', middleName: '', lastName: '', rollNo: '', department: 'CSE' }
        ],
        supervisors: [
          { salutation: '', firstName: '', middleName: '', lastName: '', designation: '', department: 'CSE' }
        ],
        certificate: null,
        year: ''
      });
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to submit BTP details.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="student-form">
      {/* <h3>BTP Details</h3> */}

      {/* Title */}
      <div className="form-row">
        <label className='required'>Title of BTP</label>
        <input name="title" value={formData.title} onChange={handleChange} required />
      </div>

      {/* Student Details */}
      <h3>Student Detail</h3>
      {formData.students.map((student, index) => (
        <div key={index} className="student-block">
          <div className="form-subgroup">
            {index > 0 && <div style={{ marginBottom: '15px' }} className="separator">_______________________________________________</div>}
            <label style={{ fontWeight: '600', fontSize: 'large' }}><u>Student {index + 1}</u></label>
            <div className="form-row">
              <label className='required'>Name</label>
              <input placeholder='First Name' name="firstName" value={student.firstName} onChange={(e) => handleStudentChange(index, e)} required />
              <input placeholder='Middle Name' name="middleName" value={student.middleName} onChange={(e) => handleStudentChange(index, e)} />
              <input placeholder='Last Name' name="lastName" value={student.lastName} onChange={(e) => handleStudentChange(index, e)} required />
            </div>
          </div>
          <div className="form-row">
            <label className='required'>Roll No</label>
            <input placeholder='Enter Roll No' name="rollNo" value={student.rollNo} onChange={(e) => handleStudentChange(index, e)} required />
            <label className='required'>Department</label>
            {/* <input placeholder='Enter Department' name="department" value={student.department} onChange={(e) => handleStudentChange(index, e)} required /> */}
            <select value={student.department} onChange={(e) => handleStudentChange(index, e)} name="department" required>
              <option>CSE</option>
              <option>CCE</option>
              <option>ECE</option>
              <option>MME</option>
              <option>Mathematics</option>
              <option>Physics</option>
              <option>HSS</option>
            </select>
          </div>
        </div>
      ))}
      <button style={{ alignSelf: 'flex-start', padding: '10px', width: '35%', backgroundColor: '#007bff', color: 'white', border: 'none' }} type="button" className="add-btn" onClick={addStudent}>Add Student</button>

      {/* Supervisor Details */}
      <h3>Supervisor Detail</h3>
      {formData.supervisors.map((sup, index) => (
        <div key={index} className="supervisor-block">
          {index > 0 && <div style={{ marginBottom: '15px' }} className="separator">_______________________________________________</div>}
          <label style={{ fontWeight: '600', fontSize: 'large' }}><u>Supervisor {index + 1}</u></label>
          <div className="form-subgroup">
            <div className="form-row">
              <label className='required'>Name</label>
              <select style={{ width: '10%' }} name="salutation" value={sup.salutation} onChange={(e) => handleSupervisorChange(index, e)} required>
                <option value="">Select</option>
                <option>Prof</option>
                <option>Dr</option>
                <option>Mr</option>
                <option>Ms</option>
              </select>
              <input placeholder="First Name" name="firstName" value={sup.firstName} onChange={(e) => handleSupervisorChange(index, e)} required />
              <input placeholder="Middle Name" name="middleName" value={sup.middleName} onChange={(e) => handleSupervisorChange(index, e)} />
              <input placeholder="Last Name" name="lastName" value={sup.lastName} onChange={(e) => handleSupervisorChange(index, e)} required />
            </div>
          </div>
          <div className="form-row">
            <label className='required'>Designation</label>
            <select name="designation" value={sup.designation} onChange={(e) => handleSupervisorChange(index, e)} required>
              <option value="">Select</option>
              <option>Assistant Professor</option>
              <option>Associate Professor</option>
              <option>Professor</option>
            </select>
            <label className='required'>Department</label>
            {/* <input placeholder='Enter Department' name="department" value={sup.department} onChange={(e) => handleSupervisorChange(index, e)} required /> */}
            <select value={sup.department} onChange={(e) => handleSupervisorChange(index, e)} name="department" required>
              <option>CSE</option>
              <option>CCE</option>
              <option>ECE</option>
              <option>MME</option>
              <option>Mathematics</option>
              <option>Physics</option>
              <option>HSS</option>
            </select>
          </div>
        </div>
      ))}
      <button style={{ alignSelf: 'flex-start', padding: '10px', width: '35%', backgroundColor: '#007bff', color: 'white', border: 'none' }} type="button" className="add-btn" onClick={addSupervisor}>Add Supervisor</button>

      {/* Certificate Upload */}
      <div className="form-row">
        <label className='required'>Academic Year</label>
        <select
          name="year"
          value={formData.year}
          onChange={handleChange}
          required
        >
          <option value="">Select Year</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        {certificateURL && (
          <>
            <label className='required'>Upload Certificate Paper</label>
            <input type="file" name="certificate" onChange={handleChange} />
            <div className="existing-certificate" style={{ display: 'flex', gap: '2rem' }}>
              <p style={{ fontWeight: 'bold' }}>Existing Certificate:</p>
              <a style={{ alignSelf: 'center' }} href={certificateURL} target="_blank" rel="noopener noreferrer">
                View Certificate
              </a>
            </div>
          </>
        )}

        {!certificateURL && (
          <>
            <label className='required'>Upload Certificate Paper</label>
            <input type="file" name="certificate" onChange={handleChange} required />
          </>
        )}
      </div>

      <button type="submit" className="submit-btn">Submit</button>
    </form>
  );
};

export default BTPDetails;
