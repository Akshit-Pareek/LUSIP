import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Student.css';

const PaperPresentation = ({ editData }) => {
  const isEditing = !!editData;
  const navigate = useNavigate();
  const [certificateURL, setCertificateURL] = useState(null);

  const [formData, setFormData] = useState({
    student: { firstName: '', middleName: '', lastName: '', rollNo: '', programme: 'B.Tech.', department: 'CSE' },
    paperTitle: '',
    mode: '',
    sponsoringAgency: '',
    eventTitle: '',
    abbreviation: '',
    fundedByInstitute: '',
    amountFunded: '',
    organizer: '',
    venue: { city: '', state: '', country: '' },
    fromDate: '',
    toDate: '',
    achievement: '',
    certificate: null
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        student: {
          firstName: editData.firstName || '',
          middleName: editData.middleName || '',
          lastName: editData.lastName || '',
          rollNo: editData.rollNo || '',
          programme: editData.programme || '',
          department: editData.department || ''
        },
        paperTitle: editData.paperTitle || '',
        mode: editData.mode || '',
        sponsoringAgency: editData.sponsoringAgency || '',
        eventTitle: editData.eventTitle || '',
        abbreviation: editData.abbreviation || '',
        fundedByInstitute: editData.fundedByInstitute || '',
        amountFunded: editData.amountFunded || '',
        organizer: editData.organizer || '',
        venue: {
          city: editData.venueCity || '',
          state: editData.venueState || '',
          country: editData.venueCountry || ''
        },
        fromDate: editData.fromDate.slice(0,10) || '',
        toDate: editData.toDate.slice(0,10) || '',
        achievement: editData.achievement || '',
        certificate: null
      });

      if (editData.certificate) {
        const relativePath = editData.certificate.split('\\').pop(); // replace Windows backslashes
        const encodedPath = encodeURIComponent(relativePath);
        setCertificateURL(`http://localhost:5000/uploads/PaperPresentation/${encodedPath}`);
        console.log('Certificate URL:', `http://localhost:5000/uploads/PaperPresentation/${encodedPath}`);
      }
      else {
        setCertificateURL(null);
      }
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'certificate') {
      setFormData({ ...formData, certificate: files[0] });
    } else if (name.startsWith('venue.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        venue: { ...formData.venue, [field]: value }
      });
    } else if (name.startsWith('student.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        student: { ...formData.student, [field]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append('student', JSON.stringify(formData.student));
    fd.append('paperTitle', formData.paperTitle);
    fd.append('mode', formData.mode);
    fd.append('sponsoringAgency', formData.sponsoringAgency);
    fd.append('eventTitle', formData.eventTitle);
    fd.append('abbreviation', formData.abbreviation);
    fd.append('fundedByInstitute', formData.fundedByInstitute);
    fd.append('amountFunded', formData.amountFunded);
    fd.append('organizer', formData.organizer);
    fd.append('venue', JSON.stringify(formData.venue));
    fd.append('fromDate', formData.fromDate);
    fd.append('toDate', formData.toDate);
    fd.append('achievement', formData.achievement);
    if (formData.certificate) {
      fd.append('certificate', formData.certificate);
    }

    try {
      const url = isEditing
        ? `http://localhost:5000/api/paper-presentations/${editData.id}`
        : `http://localhost:5000/api/paper-presentations`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: fd,
      });

      const result = await response.json();
      if (result.success) {
        alert('Paper presentation submitted successfully!');
        // setFormData({
        //   student: { firstName: '', middleName: '', lastName: '', rollNo: '', programme: '', department: '' },
        //   paperTitle: '',
        //   mode: '',
        //   sponsoringAgency: '',
        //   eventTitle: '',
        //   abbreviation: '',
        //   fundedByInstitute: '',
        //   amountFunded: '',
        //   organizer: '',
        //   venue: { city: '', state: '', country: '' },
        //   fromDate: '',
        //   toDate: '',
        //   achievement: '',
        //   certificate: null
        // });
        // setCertificateURL(null);
        // navigate('/hod/student');
      } else {
        alert('Submission failed. Please try again.');
      }
    } catch (error) {
      console.log('Error submitting paper presentation:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="student-form">
      {/* <h3>Paper Presentation</h3> */}

      <h3>Student Details</h3>
      <div className="form-subgroup">
        <div className="form-row">
          <label className='required'>Name</label>
          <input placeholder="First Name" name="student.firstName" value={formData.student.firstName} onChange={handleChange} required />
          <input placeholder="Middle Name" name="student.middleName" value={formData.student.middleName} onChange={handleChange} />
          <input placeholder="Last Name" name="student.lastName" value={formData.student.lastName} onChange={handleChange} required />
        </div>
      </div>
      <div className="form-row">
        <label className='required'>Roll No</label>
        <input placeholder='Enter Roll No.' name="student.rollNo" value={formData.student.rollNo} onChange={handleChange} required />
        <label className='required'>Programme</label>
        <select name="student.programme" value={formData.student.programme} onChange={handleChange} required>
          <option value="">Select</option>
          <option>B.Tech.</option>
          <option>B.Tech. - M.Tech.</option>
          <option>M.Tech.</option>
          <option>M.Sc.</option>
          <option>PhD</option>
        </select>
      </div>
      <div className="form-row" style={{ width: '49%' }}>
        <label className='required'>Department</label>
        {/* <input placeholder='Enter Department' name="student.department" value={formData.student.department} onChange={handleChange} required /> */}
        <select value={formData.student.department} onChange={handleChange} name="student.department" required>
          <option>CSE</option>
          <option>CCE</option>
          <option>ECE</option>
          <option>MME</option>
          <option>Mathematics</option>
          <option>Physics</option>
          <option>HSS</option>
        </select>
      </div>

      {/* <h2>Paper Details</h2> */}

      <h3>Event Details</h3>
      <div className="form-row">
        <label className='required'>Paper Title</label>
        <input placeholder="Enter Paper Title" name="paperTitle" value={formData.paperTitle} onChange={handleChange} required />
      </div>
      <div className="form-subgroup">
        <div className="form-row">
          <label className='required'>Mode of Event</label>
          <select name="mode" value={formData.mode} onChange={handleChange} required>
            <option value="">Select</option>
            <option>Offline</option>
            <option>Online</option>
            <option>Hybrid</option>
          </select>
          <label>Sponsoring Agency</label>
          <input placeholder="Enter sponsoringAgency" name="sponsoringAgency" value={formData.sponsoringAgency} onChange={handleChange} />
        </div>
        <div className="form-row">
          <label className='required'>Title of Event</label>
          <input placeholder='Enter Event Title' name="eventTitle" value={formData.eventTitle} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-row">
        <label>Abbr. of Event</label>
        <input placeholder='Enter Abbreviation' name="abbreviation" value={formData.abbreviation} onChange={handleChange} />
        <label className='required'>Funded by Institute</label>
        <select name="fundedByInstitute" value={formData.fundedByInstitute} onChange={handleChange} required>
          <option value="">Select</option>
          <option>Yes</option>
          <option>No</option>
        </select>
        {formData.fundedByInstitute === 'Yes' && (
          <div className="form-row">
            <label className='required'>Amount Funded (₹)</label>
            <input placeholder='Enter Amount Funded' name="amountFunded" value={formData.amountFunded} onChange={handleChange} required />
          </div>
        )}
      </div>

      <div className="form-row">
        <label className='required'>Organizer</label>
        <input placeholder='Name of Organization' name="organizer" value={formData.organizer} onChange={handleChange} required />
      </div>

      <div className="form-subgroup">
        <div className="form-row">
          <label className='required'>Venue</label>
          <input placeholder='City' name="venue.city" value={formData.venue.city} onChange={handleChange} required />
          <input placeholder='State' name="venue.state" value={formData.venue.state} onChange={handleChange} required />
          <input placeholder='Country' name="venue.country" value={formData.venue.country} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-subgroup">
        <div className="form-row">
          <label className='required'>From Date</label>
          <input type="date" name="fromDate" value={formData.fromDate} onChange={handleChange} required />
          <label className='required'>To Date</label>
          <input type="date" name="toDate" value={formData.toDate} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-row">
        <label>Achievement (if any)</label>
        <input placeholder='Enter Achievements' name="achievement" value={formData.achievement} onChange={handleChange} />
      </div>
      <div className="form-row">
        {certificateURL && (
          <>
            <label className='required'>Upload Certificate</label>
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
            <label className='required'>Upload Certificate</label>
            <input type="file" name="certificate" onChange={handleChange} required />
          </>
        )}
      </div>
      <button type="submit" className="submit-btn">Submit</button>
    </form>
  );
};

export default PaperPresentation;