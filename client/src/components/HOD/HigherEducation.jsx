import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Student.css';

const HigherEducation = ({ editData }) => {
  const isEditing = !!editData;
  const navigate = useNavigate();

  useEffect(() => {
    if (editData) {
      setFormData({
        firstName: editData.first_name || '',
        middleName: editData.middle_name || '',
        lastName: editData.last_name || '',
        gender: editData.gender || '',
        admittedProgramme: editData.admitted_programme || '',
        department: editData.department || 'CSE',
        institute: editData.institute || '',
        city: editData.city || '',
        state: editData.state || '',
        country: editData.country || '',
        year: editData.year || ''
      });
    }
  }, [editData]);

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    admittedProgramme: '',
    department: 'CSE',
    institute: '',
    city: '',
    state: '',
    country: '',
    year: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      const url = isEditing
        ? `http://localhost:5000/api/higher-education/${editData.id}`
        : `http://localhost:5000/api/higher-education`;
      const method = isEditing ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Form submitted successfully!');
        setFormData({
          firstName: '',
          middleName: '',
          lastName: '',
          gender: '',
          admittedProgramme: '',
          department: '',
          institute: '',
          city: '',
          state: '',
          country: '',
          year: ''
        });
        navigate('/hod/student');
      } else {
        const errorData = await response.json();
        console.error('Submission failed:', errorData.error);
        alert('Submission failed!');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Error submitting form!');
    }
  };


  // Generate years from 1900 to current year
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 1960; y--) {
    years.push(y);
  }

  return (
    <form onSubmit={handleSubmit} className="student-form">
      {/* Name */}
      <div className="form-row">
        <label className='required'>Name of Student</label>
        <input placeholder='First Name' name="firstName" value={formData.firstName} onChange={handleChange} required />
        <input placeholder='Middle Name' name="middleName" value={formData.middleName} onChange={handleChange} />
        <input placeholder='Last Name' name="lastName" value={formData.lastName} onChange={handleChange} required />
      </div>

      {/* Gender & Programme */}
      <div className="form-row">
        <label className='required'>Gender</label>
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Select</option>
          <option>Male</option>
          <option>Female</option>
        </select>
        <label className='required'>Admitted Programme</label>
        <input placeholder='Admitted Programme' name="admittedProgramme" value={formData.admittedProgramme} onChange={handleChange} required />
      </div>

      {/* Department & Institute */}
      <div className="form-row">
        <label className='required'>Department</label>
        <select value={formData.department} onChange={handleChange} name="department" required>
          <option>CSE</option>
          <option>CCE</option>
          <option>ECE</option>
          <option>MME</option>
          <option>Mathematics</option>
          <option>Physics</option>
          <option>HSS</option>
        </select>
        <label className='required'>Institute</label>
        <input placeholder='Institute' name="institute" value={formData.institute} onChange={handleChange} required />
      </div>

      {/* Place */}
      <div className="form-subgroup">
        <div className="form-row">
          <label className='required'>Place</label>
          <input placeholder='City' name="city" value={formData.city} onChange={handleChange} required />
          <input placeholder='State' name="state" value={formData.state} onChange={handleChange} required />
          <input placeholder='Country' name="country" value={formData.country} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-row" style={{width:'49%'}}>
        <label className='required'>Year of Admission</label>
        <select
          name="year"
          value={formData.year}
          onChange={handleChange}
          required
        >
          <option value="">Select Year</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <button type="submit" className="submit-btn">Submit</button>
    </form>
  );
};

export default HigherEducation;
