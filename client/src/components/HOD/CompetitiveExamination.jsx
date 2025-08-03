import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Student.css';

const CompetitiveExamination = ({ editData }) => {
  const isEditing = !!editData;
  const navigate = useNavigate();
  const [certificateURL, setCertificateURL] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    programme: '',
    rollNo: '',
    department: 'CSE',
    examName: '',
    examRollNo: '',
    yearOfQualification: '',
    certificate: null,
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        firstName: editData.firstName || '',
        middleName: editData.middleName || '',
        lastName: editData.lastName || '',
        gender: editData.gender || '',
        programme: editData.programme || '',
        rollNo: editData.rollNo || '',
        department: editData.department || 'CSE',
        examName: editData.examName || '',
        examRollNo: editData.examRollNo || '',
        yearOfQualification: editData.yearOfQualification || '',
        certificate: null,
      });
      if (editData.certificatePath) {
        const relativePath = editData.certificatePath.split('\\').pop(); // replace Windows backslashes
        const encodedPath = encodeURIComponent(relativePath);
        setCertificateURL(`http://localhost:5000/uploads/CompetitiveExams/${encodedPath}`);
        console.log('Certificate URL:', `http://localhost:5000/uploads/CompetitiveExams/${encodedPath}`);
      }
      else {
        setCertificateURL(null);
      }
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'certificate') payload.append(key, value);
      else {
        if (formData.certificate) payload.append('certificate', formData.certificate);
      }
    });

    try {
      const url = isEditing
        ? `http://localhost:5000/api/competitive-exams/${editData.id}`
        : `http://localhost:5000/api/competitive-exams`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: payload
      });

      const result = await response.json();

      if (response.ok) {
        alert('Competitive Examination data submitted successfully!');

        // Reset form if needed
        setFormData({
          firstName: '',
          middleName: '',
          lastName: '',
          gender: '',
          programme: '',
          rollNo: '',
          department: 'CSE',
          examName: '',
          examRollNo: '',
          yearOfQualification: '',
          certificate: null
        });
        setCertificateURL(null);
        navigate('/hod/student');
      } else {
        alert(`Error: ${result.error || 'Submission failed'}`);
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('An unexpected error occurred. Please try again.');
    }
  };


  return (
    <form onSubmit={handleSubmit} className="student-form">
      {/* <h2>Competitive Examination</h2> */}

      {/* Name */}
      <div className="form-subgroup">
        <div className="form-row">
          <label className='required'>Name of Student</label>
          <input placeholder='First Name' name="firstName" value={formData.firstName} onChange={handleChange} required />
          <input placeholder='Middle Name' name="middleName" value={formData.middleName} onChange={handleChange} />
          <input placeholder='Last Name' name="lastName" value={formData.lastName} onChange={handleChange} required />
        </div>
      </div>
      {/* Gender and Programme */}
      <div className="form-row">
        <label className='required'>Gender</label>
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Select</option>
          <option>Male</option>
          <option>Female</option>
        </select>
        <label className='required'>Programme</label>
        <select name="programme" value={formData.programme} onChange={handleChange} required>
          <option value="">Select</option>
          <option>B.Tech.</option>
          <option>B.Tech. - M.Tech.</option>
          <option>M.Tech.</option>
          <option>M.S.(By Research)</option>
          <option>M.Sc.</option>
          <option>PhD</option>
        </select>
      </div>

      {/* Roll No and Department */}
      <div className="form-row">
        <label className='required'>Roll No</label>
        <input placeholder='Enter Roll No' name="rollNo" value={formData.rollNo} onChange={handleChange} required />
        <label className='required'>Department</label>
        {/* <input placeholder='Enter Department' name="department" value={formData.department} onChange={handleChange} required /> */}
        <select value={formData.department} onChange={handleChange} name="department" required>
          <option>CSE</option>
          <option>CCE</option>
          <option>ECE</option>
          <option>MME</option>
          <option>Mathematics</option>
          <option>Physics</option>
          <option>HSS</option>
        </select>
      </div>

      {/* Exam Details */}
      <div className="form-row">
        <label className='required'>Name of Exam</label>
        <input placeholder='Enter Examination Name' name="examName" value={formData.examName} onChange={handleChange} required />
      </div>

      {/* Year and Upload */}
      <div className="form-row">
        <label className='required'>Exam Roll/Reg. No.</label>
        <input placeholder='Enter Exam Roll No' name="examRollNo" value={formData.examRollNo} onChange={handleChange} required />
        {console.log(certificateURL)}
        {certificateURL && (
          <>
            <div className="form-row" style={{marginBottom:'0'}}>
              <label className='required'>Upload Qualification Certificate</label>
              <input name="certificate" type="file" onChange={handleChange} />
              <div className="existing-certificate" style={{ display: 'flex', gap: '2rem' }}>
                <p style={{ fontWeight: 'bold' }}>Existing Certificate:</p>
                <a style={{ alignSelf: 'center' }} href={certificateURL} target="_blank" rel="noopener noreferrer">
                  View Certificate
                </a>
              </div>
            </div>
          </>
        )}

        {!certificateURL && (
          <>
            <label className='required'>Upload Qualification Certificate</label>
            <input name="certificate" type="file" onChange={handleChange} required />
          </>
        )}
      </div>
      <div className="form-row" style={{ width: '45%' }}>
        <label className='required'>Year of Qualification</label>
        <input placeholder='Enter Year Of Qualification' name="yearOfQualification" type="number" value={formData.yearOfQualification} onChange={handleChange} required />
      </div>
      <button type="submit" className="submit-btn">Submit</button>
    </form>
  );
};

export default CompetitiveExamination;
