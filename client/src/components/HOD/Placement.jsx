import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Student.css';

const Placement = ({ editData }) => {
  const isEditing = !!editData;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    programme: '',
    rollNo: '',
    department: 'CSE',
    companyName: '',
    package: '',
    source: '',
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
        companyName: editData.companyName || '',
        package: editData.package || '',
        source: editData.source || '',
      });
    }
  }, [editData]);

  console.log('Placement Edit Data:', formData);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = isEditing
        ? `http://localhost:5000/api/placement/${editData.id}`
        : `http://localhost:5000/api/placement`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        alert('Placement record submitted successfully');
        setFormData({
          firstName: '',
          middleName: '',
          lastName: '',
          gender: '',
          programme: '',
          rollNo: '',
          department: 'CSE',
          companyName: '',
          package: '',
          source: '',
        });
        navigate('/hod/student');
      } else {
        alert(result.error || 'Submission failed');
      }
    } catch (err) {
      console.error('Submit Error:', err);
      alert('Error submitting placement form');
    }
  };


  return (
    <form className="student-form" onSubmit={handleSubmit} >
      {/* <h2>Placement Form</h2> */}

      < div className="form-subgroup" >
        <div className="form-row">
          <label className='required'>Name of Student</label>
          <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
          <input name="middleName" placeholder="Middle Name" value={formData.middleName} onChange={handleChange} />
          <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
        </div>
      </div >

      <div className="form-row">
        <label className='required'>Gender</label>
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Select</option>
          <option >Male</option>
          <option >Female</option>
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

      <div className="form-row">
        <label className='required'>Roll No.</label>
        <input name="rollNo" placeholder="Roll No" value={formData.rollNo} onChange={handleChange} required />
        <label className='required'>Department</label>
        {/* <input name="department" placeholder="Department" value={formData.department} onChange={handleChange} required /> */}
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

      <div className="form-row">
        <label className='required'>Name of Company</label>
        <input name="companyName" placeholder="Company/Industry Name" value={formData.companyName} onChange={handleChange} required />
        <label className='required'>Package</label>
        <input name="package" placeholder="Package (₹)" value={formData.package} onChange={handleChange} required />
      </div>

      <div className="form-row" style={{ width: '49%' }}>
        <label className='required'>Source</label>
        <select name="source" value={formData.source} onChange={handleChange} required>
          <option value="">Select</option>
          <option>On-Campus</option>
          <option>Off-Campus</option>
        </select>
      </div>

      <button type="submit" className="submit-btn">Submit</button>
    </form >
  );
};

export default Placement;
