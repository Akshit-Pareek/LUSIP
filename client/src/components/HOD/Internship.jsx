import React, { useEffect, useState } from 'react';
import './Student.css';
import { useNavigate } from 'react-router-dom';


const Internship = ({ editData }) => {
    const isEditing = !!editData;
    const navigate = useNavigate();
    const [certificateURL, setCertificateURL] = useState(null);

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
                internshipType: editData.internshipType || 'Summer Internship',
                companyName: editData.companyName || '',
                package: editData.package || '',
                stipend: editData.stipend || '',
                source: editData.source || '',
                certificate: null,
                dateFrom: editData.dateFrom.slice(0,10) || '',
                dateTo: editData.dateTo.slice(0,10) || ''

            });
            if (editData.certificate) {
                const relativePath = editData.certificate.split('\\').pop(); // replace Windows backslashes
                const encodedPath = encodeURIComponent(relativePath);
                setCertificateURL(`http://localhost:5000/uploads/Internships/${encodedPath}`);
                console.log('Certificate URL:', `http://localhost:5000/uploads/Internships/${encodedPath}`);
            }
            else {
                setCertificateURL(null);
            }
        }
    }, [editData]);


    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        gender: '',
        programme: '',
        rollNo: '',
        department: 'CSE',
        internshipType: 'Summer Internship',
        companyName: '',
        package: '',
        stipend: '',
        source: '',
        certificate: null,
        dateFrom: '',
        dateTo: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, certificate: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form data before submission:', formData);
        const fd = new FormData();
        fd.append('firstName', formData.firstName);
        fd.append('middleName', formData.middleName);
        fd.append('lastName', formData.lastName);
        fd.append('gender', formData.gender);
        fd.append('programme', formData.programme);
        fd.append('rollNo', formData.rollNo);
        fd.append('department', formData.department);
        fd.append('internshipType', formData.internshipType);
        fd.append('companyName', formData.companyName);
        fd.append('package', formData.package || ''); // Optional
        fd.append('stipend', formData.stipend || ''); // Optional
        fd.append('source', formData.source || '');   // Optional
        fd.append('dateFrom', formData.dateFrom);
        fd.append('dateTo', formData.dateTo);
        if (formData.certificate) {
            fd.append('certificate', formData.certificate);
        }
        // console.log('FormData before submission:', fd);
        for (let [key, value] of fd.entries()) {
            console.log(key, value);
        }
        try {
            const url = isEditing
                ? `http://localhost:5000/api/internship/${editData.id}`
                : `http://localhost:5000/api/internship`;
            const method = isEditing ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method: method,
                body: fd
            });

            const result = await response.json();
            if (response.ok) {
                alert('Internship submitted successfully!');
                setFormData({
                    firstName: '',
                    middleName: '',
                    lastName: '',
                    gender: '',
                    programme: '',
                    rollNo: '',
                    department: 'CSE',
                    internshipType: 'Summer Internship',
                    companyName: '',
                    package: '',
                    stipend: '',
                    source: '',
                    certificate: null,
                    dateFrom: '',
                    dateTo: ''
                });
                setCertificateURL(null);
                navigate('/hod/student'); // Redirect to the internship page
                console.log(result);
            } else {
                console.error('Server error:', result.message || result);
                alert('Submission failed.');
            }
        } catch (err) {
            console.error('Error submitting internship:', err);
            alert('Something went wrong!');
        }
    };

    const isSLI = formData.internshipType === 'Semester Long Internship (SLI)';
    const isSummer = formData.internshipType === 'Summer Internship';

    return (
        <form className="student-form" onSubmit={handleSubmit}>
            {/* <h2>Internship Form</h2> */}

            <div className="form-subgroup">
                <div className="form-row">
                    <label className='required'>Name of Student</label>
                    <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
                    <input name="middleName" placeholder="Middle Name" value={formData.middleName} onChange={handleChange} />
                    <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
                </div>
            </div>

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
                <label className='required'>Type</label>
                <select name="internshipType" value={formData.internshipType} onChange={handleChange}>
                    <option value='Summer Internship'>Summer Internship</option>
                    <option value='Semester Long Internship (SLI)'>Semester Long Internship (SLI)</option>
                </select>

                <label className='required'>Name of Company</label>
                <input name="companyName" placeholder="Company/Industry Name" value={formData.companyName} onChange={handleChange} required />
            </div>

            {isSLI && (
                <>
                    <div className="form-row">
                        <label className='required'>Package (₹)</label>
                        <input name="package" placeholder="Package (₹)" value={formData.package} onChange={handleChange} required />
                        <label className='required'>Source</label>
                        <select name="source" value={formData.source} onChange={handleChange} required>
                            <option value="">Select</option>
                            <option>On-Campus</option>
                            <option>Off-Campus</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <label className='required'>Stipend (₹)</label>
                        <input name="stipend" placeholder="Stipend (₹)" value={formData.stipend} onChange={handleChange} required />
                    </div>
                </>
            )}

            {isSummer && (
                <div className="form-row">
                    <label className='required'>Stipend (₹)</label>
                    <input name="stipend" placeholder="Stipend (₹)" value={formData.stipend} onChange={handleChange} required />
                    <label className='required'>Source</label>
                    <select name="source" value={formData.source} onChange={handleChange} required>
                        <option value="">Select</option>
                        <option>On-Campus</option>
                        <option>Off-Campus</option>
                    </select>
                </div>
            )}

            <div className="form-row">
                <label className='required'>From</label>
                <input
                    type="date"
                    name="dateFrom"
                    value={formData.dateFrom}
                    onChange={handleChange}
                    required
                />
                <label className='required'>To</label>
                <input
                    type="date"
                    name="dateTo"
                    value={formData.dateTo}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-row">
                {certificateURL && (
                    <>
                        <label className='required'>Upload Certificate</label>
                        <input type="file" name="certificate" onChange={handleFileChange} />
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
                        <input type="file" name="certificate" onChange={handleFileChange} required />
                    </>
                )}
            </div>
            <button type="submit" className="submit-btn">Submit</button>
        </form>
    );
};

export default Internship;
