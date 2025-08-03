import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import './ProjectPatentMoU.css';

const initialName = { salutation: 'Prof', firstName: '', middleName: '', lastName: '' };

const ProjectPatentMoU = () => {
  const location = useLocation();
  const editData = location.state ? location.state.data : null;
  const isEditing = !!editData;
  const navigate = useNavigate();
  const [certificateURL, setCertificateURL] = useState(null);

  const [category, setCategory] = useState('Research and Development');

  // Common states for all categories
  const [projectData, setProjectData] = useState({
    title: '',
    projectId: '',
    awardingAgency: '',
    typeOfFunding: 'Government',
    otherFundingDetails: '',
    principalInvestigator: { ...initialName, designation: '', department: '', institute: '' },
    coPrincipalInvestigator: [{ ...initialName, designation: '', department: '', institute: '' }],
    duration: '',
    amount: '',
    certificate: null,
    research_date: ''          // <-- Added
  });

  const [consultancyData, setConsultancyData] = useState({
    title: '',
    projectId: '',
    facultyInCharge: [{ ...initialName, designation: '', department: '', institute: '' }],
    collaborationAgency: '',
    duration: '',
    amount: '',
    certificate: null,
    consultancy_date: ''       // <-- Added
  });

  const [patentData, setPatentData] = useState({
    type: 'Filed',
    title: '',
    inventors: [{ ...initialName, designation: '', department: '', institute: '' }],
    agency: '',
    month: '',
    year: '',
    certificate: null
  });

  const [mouData, setMouData] = useState({
    organizationName: '',
    organizationSector: '',
    departmentAtInstitute: '',
    signedOnDate: '',
    signedOnMonth: '',
    signedOnYear: '',
    level: 'National',
    typeOfMoU: '',
    activities: [''],
    certificate: null
  });

  useEffect(() => {
    if (editData) {
      if (editData.category === 'Research and Development') {
        setCategory('Research and Development');
        setProjectData({
          ...projectData,
          ...editData,
          research_date: editData.research_date.slice(0, 10) || '',
          principalInvestigator: editData.pi_name || [{ ...initialName, designation: '', department: '', institute: '' }],
          coPrincipalInvestigator: editData.co_pi_name ?
            editData.co_pi_name.map(p => ({
              salutation: p.salutation || 'Prof',
              firstName: p.firstName || '',
              middleName: p.middleName || '',
              lastName: p.lastName || '',
              designation: p.designation || '',
              department: p.department || '',
              institute: p.institute || '',
            })) : [{ ...initialName, designation: '', department: '', institute: '' }]
        });
        if (editData.certificate) {
          const relativePath = editData.certificate.split('\\').pop(); // replace Windows backslashes
          const encodedPath = encodeURIComponent(relativePath);
          setCertificateURL(`http://localhost:5000/uploads/ProjectPatentMoU/${encodedPath}`);
          console.log('Certificate URL:', `http://localhost:5000/uploads/ProjectPatentMoU/${encodedPath}`);
        }
        else {
          setCertificateURL(null);
        }
      } else if (editData.category === 'Consultancy') {
        setCategory('Consultancy');
        setConsultancyData({
          ...consultancyData,
          ...editData,
          consultancy_date: editData.consultancy_date.slice(0, 10) || '',
          facultyInCharge: editData.faculty_in_charge ?
            editData.faculty_in_charge.map(p => ({
              salutation: p.salutation || 'Prof',
              firstName: p.firstName || '',
              middleName: p.middleName || '',
              lastName: p.lastName || '',
              designation: p.designation || '',
              department: p.department || '',
              institute: p.institute || '',
            })) : [{ ...initialName, designation: '', department: '', institute: '' }]
        });
        if (editData.certificate) {
          const relativePath = editData.certificate.split('\\').pop(); // replace Windows backslashes
          const encodedPath = encodeURIComponent(relativePath);
          setCertificateURL(`http://localhost:5000/uploads/ProjectPatentMoU/${encodedPath}`);
          console.log('Certificate URL:', `http://localhost:5000/uploads/ProjectPatentMoU/${encodedPath}`);
        }
        else {
          setCertificateURL(null);
        }
      } else if (editData.category === 'Patent') {
        setCategory('Patent');
        setPatentData({
          ...patentData,
          ...editData,
          type: editData.patent_type,
          agency: editData.patent_agency,
          // Combine year and month for input type="month" (format: "YYYY-MM")
          month: editData.patent_year && editData.patent_month
            ? `${editData.patent_year}-${editData.patent_month.padStart(2, '0')}`
            : '',
          year: editData.patent_year || '',
          inventors: editData.inventors ?
            editData.inventors.map(p => ({
              salutation: p.salutation || 'Prof',
              firstName: p.firstName || '',
              middleName: p.middleName || '',
              lastName: p.lastName || '',
              designation: p.designation || '',
              department: p.department || '',
              institute: p.institute || '',
            })) : [{ ...initialName, designation: '', department: '', institute: '' }]
        });
        if (editData.certificate) {
          const relativePath = editData.certificate.split('\\').pop(); // replace Windows backslashes
          const encodedPath = encodeURIComponent(relativePath);
          setCertificateURL(`http://localhost:5000/uploads/ProjectPatentMoU/${encodedPath}`);
          console.log('Certificate URL:', `http://localhost:5000/uploads/ProjectPatentMoU/${encodedPath}`);
        }
        else {
          setCertificateURL(null);
        }
      } else if (editData.category === 'MoU') {
        setCategory('MoU');
        setMouData({
          ...mouData,
          ...editData,
          signedOnDate: editData.signedOnDate.slice(0, 10),
          activities: editData.activities || ['']
        });
        if (editData.certificate) {
          const relativePath = editData.certificate.split('\\').pop(); // replace Windows backslashes
          const encodedPath = encodeURIComponent(relativePath);
          setCertificateURL(`http://localhost:5000/uploads/ProjectPatentMoU/${encodedPath}`);
          console.log('Certificate URL:', `http://localhost:5000/uploads/ProjectPatentMoU/${encodedPath}`);
        }
        else {
          setCertificateURL(null);
        }
      }
    }
    // eslint-disable-next-line
  }, [editData]);

  // Handlers

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  // Common input change for Project
  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    if (name === 'duration' || name === 'amount') {
      if (isNaN(value) || value < 0) {
        alert(`${name} can't be a negative number`);
        return;
      }
    }
    setProjectData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrincipalInvestigatorChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({
      ...prev,
      principalInvestigator: { ...prev.principalInvestigator, [name]: value }
    }));
  };

  const handleCoPrincipalInvestigatorChange = (index, e) => {
    const { name, value } = e.target;
    setProjectData(prev => {
      const updated = [...prev.coPrincipalInvestigator];
      updated[index] = { ...updated[index], [name]: value };
      return { ...prev, coPrincipalInvestigator: updated };
    });
  };

  const handleProjectCertificateChange = (e) => {
    setProjectData(prev => ({ ...prev, certificate: e.target.files[0] }));
  };

  // For Type of Funding other details
  const handleTypeOfFundingChange = (e) => {
    const { value } = e.target;
    setProjectData(prev => ({
      ...prev,
      typeOfFunding: value,
      otherFundingDetails: value === 'Non-Government' ? prev.otherFundingDetails : ''
    }));
  };

  const handleOtherFundingDetailsChange = (e) => {
    setProjectData(prev => ({ ...prev, otherFundingDetails: e.target.value }));
  };

  // Consultancy Handlers

  const handleConsultancyChange = (e) => {
    const { name, value } = e.target;
    if (name === 'duration' || name === 'amount') {
      if (isNaN(value) || value < 0) {
        alert(`${name} can't be a negative number`);
        return;
      }
    }
    setConsultancyData(prev => ({ ...prev, [name]: value }));
  };

  const handleFacultyInChargeChange = (index, e) => {
    const { name, value } = e.target;
    setConsultancyData(prev => {
      const updated = [...prev.facultyInCharge];
      updated[index] = { ...updated[index], [name]: value };
      return { ...prev, facultyInCharge: updated };
    });
  };

  const addFacultyInCharge = () => {
    setConsultancyData(prev => ({
      ...prev,
      facultyInCharge: [...prev.facultyInCharge, { ...initialName, designation: '', department: '', institute: '' }]
    }));
  };

  const handleConsultancyCertificateChange = (e) => {
    setConsultancyData(prev => ({ ...prev, certificate: e.target.files[0] }));
  };

  // Patent Handlers

  const handlePatentChange = (e) => {
    const { name, value } = e.target;
    if (name === 'month') {
      const [month] = value.split('-')[1];
      const [year] = value.split('-');
      setPatentData(prev => ({
        ...prev,
        month: value,  // e.g. "2025-06"
        year: year     // e.g. "2025"
      }));
    } else {
      setPatentData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleInventorChange = (index, e) => {
    const { name, value } = e.target;
    setPatentData(prev => {
      const updated = [...prev.inventors];
      updated[index] = { ...updated[index], [name]: value };
      return { ...prev, inventors: updated };
    });
  };

  const handlePatentCertificateChange = (e) => {
    setPatentData(prev => ({ ...prev, certificate: e.target.files[0] }));
  };

  // MoU Handlers

  const handleMouChange = (e) => {
    const { name, value } = e.target;
    setMouData(prev => ({ ...prev, [name]: value }));
  };

  const handleMouActivityChange = (index, e) => {
    const updated = [...mouData.activities];
    updated[index] = e.target.value;
    setMouData(prev => ({ ...prev, activities: updated }));
  };

  const addMouActivity = () => {
    setMouData(prev => ({ ...prev, activities: [...prev.activities, ''] }));
  };

  const handleMouCertificateChange = (e) => {
    setMouData(prev => ({ ...prev, certificate: e.target.files[0] }));
  };

  const addInventor = () => {
    setPatentData(prev => ({
      ...prev,
      inventors: [...prev.inventors, { ...initialName, designation: '', department: '', institute: '' }]
    }));
  };
  const addInvestigator = () => {
    setProjectData(prev => ({
      ...prev,
      coPrincipalInvestigator: [...prev.coPrincipalInvestigator, { ...initialName, designation: '', department: '', institute: '' }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('category', category);
      if (category === 'Research and Development') {
        // Append text fields
        Object.entries(projectData).forEach(([key, value]) => {
          if (key === 'principalInvestigator' || key === 'coPrincipalInvestigator') {
            if (key === 'principalInvestigator') formData.append('principalInvestigator', JSON.stringify(projectData.principalInvestigator));
            if (key === 'coPrincipalInvestigator') formData.append('coPrincipalInvestigator', JSON.stringify(projectData.coPrincipalInvestigator));
          } else if (key === 'certificate') {
            if (value) formData.append('certificate', value);
          } else {
            formData.append(key, value || '');
          }
        });
      } else if (category === 'Consultancy') {
        Object.entries(consultancyData).forEach(([key, value]) => {
          if (key === 'facultyInCharge') formData.append('facultyInCharge', JSON.stringify(consultancyData.facultyInCharge) || '');
          else if (key === 'certificate') {
            if (value) formData.append('certificate', value);
          } else {
            formData.append(key, value || '');
          }
        });
      } else if (category === 'Patent') {
        Object.entries(patentData).forEach(([key, value]) => {
          if (key === 'inventors') formData.append('inventors', JSON.stringify(patentData.inventors) || '');
          else if (key === 'certificate') {
            if (value) formData.append('certificate', value);
          } else if (key === 'month') {
            formData.append(key, (value && value.split('-')[1]) || '');
          } else {
            formData.append(key, value || '');
          }
        });
      } else if (category === 'MoU') {
        Object.entries(mouData).forEach(([key, value]) => {
          if (key === 'activities') formData.append('activities', JSON.stringify(mouData.activities) || '');
          else if (key === 'certificate') {
            if (value) formData.append('certificate', value);
          } else {
            formData.append(key, value || '');
          }
        });
      }

      // Send to backend
      const url = isEditing
        ? `http://localhost:5000/api/project-patent-mou/${editData.id}`
        : `http://localhost:5000/api/project-patent-mou`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to submit form');
      }

      const result = await response.json();
      alert('Form submitted successfully!');
      console.log('Server response:', result);
      if (!isEditing) {
        setProjectData({
          title: '',
          projectId: '',
          awardingAgency: '',
          typeOfFunding: 'Government',
          otherFundingDetails: '',
          principalInvestigator: { ...initialName, designation: '', department: '', institute: '' },
          coPrincipalInvestigator: [{ ...initialName, designation: '', department: '', institute: '' }],
          duration: '',
          amount: '',
          certificate: null,
          research_date: ''         // <-- Added
        });
        setConsultancyData({
          title: '',
          projectId: '',
          facultyInCharge: [{ ...initialName, designation: '', department: '', institute: '' }],
          collaborationAgency: '',
          duration: '',
          amount: '',
          certificate: null,
          consultancy_date: ''      // <-- Added
        });
        setPatentData({
          type: 'Filed',
          title: '',
          inventors: [{ ...initialName, designation: '', department: '', institute: '' }],
          agency: '',
          month: '',
          year: '',
          certificate: null
        });
        setMouData({
          organizationName: '',
          organizationSector: '',
          departmentAtInstitute: '',
          signedOnDate: '',
          signedOnMonth: '',
          signedOnYear: '',
          level: 'National',
          typeOfMoU: '',
          activities: [''],
          certificate: null
        });
        setCertificateURL(null);
        navigate('/hod/project_patent_mou');

      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form: ' + error.message);
    }
  };

  return (
    <div className="ppm-container">
      {/* <h2>Project, Patent, MoU Entry</h2> */}


      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-row">
          <label>
            <span>Category</span>
            <select value={category} onChange={handleCategoryChange}>
              <option value='Research and Development'>Research and Development</option>
              <option value='Consultancy'>Consultancy</option>
              <option value='Patent'>Patent</option>
              <option value='MoU'>MoU</option>
            </select>
          </label>
        </div>

        {category === 'Research and Development' && (
          <>
            <div className="form-row">
              <label>
                <span className="required">Title</span>
                <input type="text" name="title" value={projectData.title} onChange={handleProjectChange} required />
              </label>
              <label>
                <span className="required">Project ID</span>
                <input type="text" name="projectId" value={projectData.projectId} onChange={handleProjectChange} required />
              </label>
            </div>

            <div className="form-row">
              <label>
                <span className="required">Awarding Agency</span>
                <input type="text" name="awardingAgency" value={projectData.awardingAgency} onChange={handleProjectChange} required />
              </label>

              <label>
                <span className="required">Type of Funding</span>
                <select name="typeOfFunding" value={projectData.typeOfFunding} onChange={handleTypeOfFundingChange}>
                  <option>Government</option>
                  <option>Non-Government</option>
                </select>
              </label>
            </div>

            {projectData.typeOfFunding === 'Non-Government' && (
              <div className="form-row">
                <label>
                  <span className="required">Enter Funding Details</span>
                  <input
                    type="text"
                    name="otherFundingDetails"
                    value={projectData.otherFundingDetails}
                    onChange={handleOtherFundingDetailsChange}
                    required={projectData.typeOfFunding === 'Non-Government'}
                  />
                </label>
              </div>
            )}

            <fieldset>
              <legend>Principal Investigator</legend>
              <div className="form-row sub-group">
                <label>
                  <span>Salutation</span>
                  <select name="salutation" value={projectData.principalInvestigator.salutation} onChange={(e) => handlePrincipalInvestigatorChange(e)}>
                    <option>Prof</option>
                    <option>Dr</option>
                    <option>Mr</option>
                    <option>Ms</option>
                  </select>
                </label>
                <label>
                  <span className="required">First Name</span>
                  <input type="text" name="firstName" value={projectData.principalInvestigator.firstName} onChange={handlePrincipalInvestigatorChange} required />
                </label>
                <label>Middle Name
                  <input type="text" name="middleName" value={projectData.principalInvestigator.middleName} onChange={handlePrincipalInvestigatorChange} />
                </label>
                <label>
                  <span className="required">Last Name</span>
                  <input type="text" name="lastName" value={projectData.principalInvestigator.lastName} onChange={handlePrincipalInvestigatorChange} required />
                </label>
              </div>
              <div className="form-row sub-group">
                <label>
                  <span className="required">Designation</span>
                  <input type="text" name="designation" value={projectData.principalInvestigator.designation} onChange={handlePrincipalInvestigatorChange} required />
                </label>
                <label>
                  <span className="required">Department</span>
                  <input type="text" name="department" value={projectData.principalInvestigator.department} onChange={handlePrincipalInvestigatorChange} required />
                </label>
              </div>
              <div className="form-row sub-group">
                <label>
                  <span className="required">Institute/Organization</span>
                  <input type="text" name="institute" value={projectData.principalInvestigator.institute} onChange={handlePrincipalInvestigatorChange} required />
                </label>
              </div>
            </fieldset>

            {projectData.coPrincipalInvestigator.map((cpi, idx) => (
              <>
                <fieldset key={idx}>
                  <legend>Co-Principal Investigator {idx + 1} </legend>
                  <div className="form-row sub-group">
                    <label>
                      <span>Salutation</span>
                      <select name="salutation" value={cpi.salutation} onChange={(e) => handleCoPrincipalInvestigatorChange(idx, e)}>
                        <option>Prof</option>
                        <option>Dr</option>
                        <option>Mr</option>
                        <option>Ms</option>
                      </select>
                    </label>
                    <label>
                      <span className="required">First Name</span>
                      <input type="text" name="firstName" value={cpi.firstName} onChange={(e) => handleCoPrincipalInvestigatorChange(idx, e)} required />
                    </label>
                    <label>Middle Name
                      <input type="text" name="middleName" value={cpi.middleName} onChange={(e) => handleCoPrincipalInvestigatorChange(idx, e)} />
                    </label>
                    <label>
                      <span className="required">Last Name</span>
                      <input type="text" name="lastName" value={cpi.lastName} onChange={(e) => handleCoPrincipalInvestigatorChange(idx, e)} required />
                    </label>
                  </div>
                  <div className="form-row sub-group">
                    <label>
                      <span className="required">Designation</span>
                      <input type="text" name="designation" value={cpi.designation} onChange={(e) => handleCoPrincipalInvestigatorChange(idx, e)} required />
                    </label>
                    <label>
                      <span className="required">Department</span>
                      <input type="text" name="department" value={cpi.department} onChange={(e) => handleCoPrincipalInvestigatorChange(idx, e)} required />
                    </label>
                  </div>
                  <div className="form-row sub-group">
                    <label>
                      <span className="required">Institute/Organization</span>
                      <input type="text" name="institute" value={cpi.institute} onChange={(e) => handleCoPrincipalInvestigatorChange(idx, e)} required />
                    </label>
                  </div>
                </fieldset>
              </>
            ))}
            <button className='add-btn' style={{ marginTop: 0, marginBottom: '20px' }} type="button" onClick={addInvestigator}>Add+</button>

            <div className="form-row">
              <label>
                <span className="required">Date</span>
                <input
                  type="date"
                  name="research_date"
                  value={projectData.research_date}
                  onChange={handleProjectChange}
                  required
                />
              </label>
              <label>
                <span className="required">Duration(in years)</span>
                <input type="number" name="duration" value={projectData.duration} onChange={handleProjectChange} required />
              </label>
            </div>

            <div className="form-row">
              <label>
                <span className="required">Amount (₹)</span>
                <input type="number" name="amount" value={projectData.amount} onChange={handleProjectChange} required />
              </label>
              <label>
                {certificateURL && (
                  <>
                    <span className="required">Upload Project Grande Certificate</span>
                    <input type="file" accept=".pdf,.jpg,.png" onChange={handleProjectCertificateChange} />
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
                    <span className="required">Upload Project Grande Certificate</span>
                    <input type="file" accept=".pdf,.jpg,.png" onChange={handleProjectCertificateChange} required />
                  </>
                )}
              </label>
            </div>
          </>
        )}

        {category === 'Consultancy' && (
          <>
            <div className="form-row">
              <label>
                <span className="required">Title</span>
                <input type="text" name="title" value={consultancyData.title} onChange={handleConsultancyChange} required />
              </label>
              <label>
                <span className="required">Project ID</span>
                <input type="text" name="projectId" value={consultancyData.projectId} onChange={handleConsultancyChange} required />
              </label>
            </div>

            {consultancyData.facultyInCharge.map((faculty, idx) => (
              <fieldset key={idx}>
                <legend>Faculty In-Charge {idx + 1}</legend>
                <div className="form-row sub-group">
                  <label>
                    <span>Salutation</span>
                    <select name="salutation" value={faculty.salutation} onChange={(e) => handleFacultyInChargeChange(idx, e)}>
                      <option>Prof</option>
                      <option>Dr</option>
                      <option>Mr</option>
                      <option>Ms</option>
                    </select>
                  </label>
                  <label>
                    <span className="required">First Name</span>
                    <input
                      type="text"
                      name="firstName"
                      value={faculty.firstName}
                      onChange={(e) => handleFacultyInChargeChange(idx, e)}
                      required
                    />
                  </label>
                  <label>Middle Name
                    <input
                      type="text"
                      name="middleName"
                      value={faculty.middleName}
                      onChange={(e) => handleFacultyInChargeChange(idx, e)}
                    />
                  </label>
                  <label>
                    <span className="required">Last Name</span>
                    <input
                      type="text"
                      name="lastName"
                      value={faculty.lastName}
                      onChange={(e) => handleFacultyInChargeChange(idx, e)}
                      required
                    />
                  </label>
                </div>
                <div className="form-row sub-group">
                  <label>
                    <span className="required">Designation</span>
                    <input
                      type="text"
                      name="designation"
                      value={faculty.designation}
                      onChange={(e) => handleFacultyInChargeChange(idx, e)}
                      required
                    />
                  </label>
                  <label>
                    <span className="required">Department</span>
                    <input
                      type="text"
                      name="department"
                      value={faculty.department}
                      onChange={(e) => handleFacultyInChargeChange(idx, e)}
                      required
                    />
                  </label>
                </div>
                <div className="form-row sub-group">
                  <label>
                    <span className="required">Institute/Organization</span>
                    <input
                      type="text"
                      name="institute"
                      value={faculty.institute}
                      onChange={(e) => handleFacultyInChargeChange(idx, e)}
                      required
                    />
                  </label>
                </div>
              </fieldset>
            ))}

            <button type="button" onClick={addFacultyInCharge} className="add-btn">Add Faculty</button>

            <div className="form-row">
              <label>
                <span className="required">Collaboration Agency</span>
                <input type="text" name="collaborationAgency" value={consultancyData.collaborationAgency} onChange={handleConsultancyChange} required />
              </label>
              <label>
                <span className="required">Amount (₹)</span>
                <input type="number" name="amount" value={consultancyData.amount} onChange={handleConsultancyChange} required />
              </label>
            </div>

            <div className="form-row">
              <label>
                <span className="required">Date</span>
                <input
                  type="date"
                  name="consultancy_date"
                  value={consultancyData.consultancy_date}
                  onChange={handleConsultancyChange}
                  required
                />
              </label>
              <label>
                <span className="required">Duration(in years)</span>
                <input type="number" name="duration" value={consultancyData.duration} onChange={handleConsultancyChange} required />
              </label>
            </div>
            <div className="form-row">
              <label>
                {certificateURL && (
                  <>
                    <span className="required">Upload Consultancy Grande Certificate</span>
                    <input type="file" accept=".pdf,.jpg,.png" onChange={handleConsultancyCertificateChange} />
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
                    <span className="required">Upload Consultancy Grande Certificate</span>
                    <input type="file" accept=".pdf,.jpg,.png" onChange={handleConsultancyCertificateChange} required />
                  </>
                )}
              </label>
            </div>
          </>
        )}

        {category === 'Patent' && (
          <>
            <div className="form-row">
              <label>Type:
                <select name="type" value={patentData.type} onChange={handlePatentChange}>
                  <option>Filed</option>
                  <option>Published</option>
                  <option>Granted</option>
                </select>
              </label>
              <label>
                <span className="required">Title</span>
                <input type="text" name="title" value={patentData.title} onChange={handlePatentChange} required />
              </label>
            </div>

            {patentData.inventors.map((inv, idx) => (
              <fieldset key={idx}>
                <legend>Inventor {idx + 1}</legend>
                <div className="form-row sub-group">
                  <label>
                    <span>Salutation</span>
                    <select name="salutation" value={inv.salutation} onChange={(e) => handleInventorChange(idx, e)}>
                      <option>Prof</option>
                      <option>Dr</option>
                      <option>Mr</option>
                      <option>Ms</option>
                    </select>
                  </label>
                  <label>
                    <span className="required">First Name</span>
                    <input
                      type="text"
                      name="firstName"
                      value={inv.firstName}
                      onChange={(e) => handleInventorChange(idx, e)}
                      required
                    />
                  </label>
                  <label>Middle Name
                    <input
                      type="text"
                      name="middleName"
                      value={inv.middleName}
                      onChange={(e) => handleInventorChange(idx, e)}
                    />
                  </label>
                  <label>
                    <span className="required">Last Name</span>
                    <input
                      type="text"
                      name="lastName"
                      value={inv.lastName}
                      onChange={(e) => handleInventorChange(idx, e)}
                      required
                    />
                  </label>
                </div>
                <div className="form-row sub-group">
                  <label>
                    <span className="required">Designation</span>
                    <input
                      type="text"
                      name="designation"
                      value={inv.designation}
                      onChange={(e) => handleInventorChange(idx, e)}
                      required
                    />
                  </label>
                  <label>
                    <span className="required">Department</span>
                    <input
                      type="text"
                      name="department"
                      value={inv.department}
                      onChange={(e) => handleInventorChange(idx, e)}
                      required
                    />
                  </label>
                </div>
                <div className="form-row sub-group">
                  <label>
                    <span className="required">Institute/Organization</span>
                    <input
                      type="text"
                      name="institute"
                      value={inv.institute}
                      onChange={(e) => handleInventorChange(idx, e)}
                      required
                    />
                  </label>
                </div>
              </fieldset>
            ))}

            <button type="button" onClick={addInventor} className="add-btn">Add Inventor</button>

            <div className="form-row">
              <label>
                <span className="required">Agency</span>
                <input type="text" name="agency" value={patentData.agency} onChange={handlePatentChange} required />
              </label>
              <label>
                <span className="required">Month</span>
                <input type="month" name="month" value={patentData.month} onChange={handlePatentChange} required />
              </label>
            </div>

            <div className="form-row">
              {certificateURL && (
                <>
                  <label>Upload Certificate
                    <input type="file" accept=".pdf,.jpg,.png" onChange={handlePatentCertificateChange} />
                  </label>
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
                  <label>Upload Certificate
                    <input type="file" accept=".pdf,.jpg,.png" onChange={handlePatentCertificateChange} required />
                  </label>
                </>
              )}
            </div>
          </>
        )}

        {category === 'MoU' && (
          <>
            <div className="form-row">
              <label>
                <span className="required">Name of Organization</span>
                <input type="text" name="organizationName" value={mouData.organizationName} onChange={handleMouChange} required />
              </label>
              <label>
                Organization Sector
                <input type="text" name="organizationSector" value={mouData.organizationSector} onChange={handleMouChange} />
              </label>
            </div>

            <div className="form-row">
              <label>
                <span className="required">Department/Centre at Institute</span>
                <input type="text" name="departmentAtInstitute" value={mouData.departmentAtInstitute} onChange={handleMouChange} required />
              </label>
              <label>
                <span className="required">Signed On</span>
                <input type="date" name="signedOnDate" value={mouData.signedOnDate} onChange={handleMouChange} required />
              </label>
            </div>

            <div className="form-row">
              <label>Level
                <select name="level" value={mouData.level} onChange={handleMouChange}>
                  <option>National</option>
                  <option>International</option>
                </select>
              </label>
              <label>Type of MoU
                <input type="text" name="typeOfMoU" value={mouData.typeOfMoU} onChange={handleMouChange} />
              </label>
            </div>

            <fieldset>
              <legend>List of Activities</legend>
              {mouData.activities.map((activity, idx) => (
                <div key={idx} className="form-row">
                  <input
                    style={{ width: '100%' }}
                    type="text"
                    value={activity}
                    onChange={(e) => handleMouActivityChange(idx, e)}
                    placeholder="Activity bullet point"
                  />
                </div>
              ))}
              <button type="button" onClick={addMouActivity} className="add-btn">Add Activity</button>
            </fieldset>

            <div className="form-row">
              <label>
                {certificateURL && (
                  <>
                    <span className="required">Upload MoU Certificate</span>
                    <input type="file" accept=".pdf,.jpg,.png" onChange={handleMouCertificateChange} />
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
                    <span className="required">Upload MoU Certificate</span>
                    <input type="file" accept=".pdf,.jpg,.png" onChange={handleMouCertificateChange} required />
                  </>
                )}
              </label>
            </div>
          </>
        )}

        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div >
  );
};

export default ProjectPatentMoU;
