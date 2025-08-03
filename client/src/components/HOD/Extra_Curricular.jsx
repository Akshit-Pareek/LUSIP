import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Student.css';

const initialParticipant = {
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    programme: '',
    rollNo: '',
    department: 'CSE',
};

const ExtraCurricular = ({ editData }) => {

    const isEditing = !!editData;
    const navigate = useNavigate();
    const [certificateURL, setCertificateURL] = useState(null);
    const [eventURL, setEventURL] = useState(null);

    useEffect(() => {
        if (editData) {
            const conv = editData.participants ?
                editData.participants.map(p => ({
                    firstName: p.firstName || '',
                    middleName: p.middleName || '',
                    lastName: p.lastName || '',
                    gender: p.gender || '',
                    programme: p.programme || '',
                    rollNo: p.rollNo || '',
                    department: p.department || 'CSE',
                }))
                : [''];
            setFormData({
                title: editData.title || '',
                date: editData.date ? (editData.date).split('T')[0] : '',
                organizer: editData.organizer || '',
                mode: editData.mode || 'Online',
                city: editData.city || '',
                state: editData.state || '',
                country: editData.country || '',
                awardDetails: editData.award_details || '',
                certificate: null, // File input will be handled separately
                eventReport: null, // File input will be handled separately
                photograph: editData.photograph_path || '',
                participants: conv.length > 0 ? conv : [initialParticipant],
            });
            if (editData.certificate_path) {
                const relativePath = editData.certificate_path.split('\\').pop(); // replace Windows backslashes
                const encodedPath = encodeURIComponent(relativePath);
                setCertificateURL(`http://localhost:5000/uploads/ExtraCurricular/${encodedPath}`);
                console.log('Certificate URL:', `http://localhost:5000/uploads/ExtraCurricular/${encodedPath}`);
            }
            else {
                setCertificateURL(null);
            }
            if (editData.event_report_path) {
                const relativePath = editData.event_report_path.split('\\').pop(); // replace Windows backslashes
                const encodedPath = encodeURIComponent(relativePath);
                setEventURL(`http://localhost:5000/uploads/ExtraCurricular/${encodedPath}`);
                console.log('Event URL:', `http://localhost:5000/uploads/ExtraCurricular/${encodedPath}`);
            }
            else {
                setEventURL(null);
            }
        }
    }, [editData]);

    const [formData, setFormData] = useState({
        title: '',
        date: '',
        organizer: '',
        mode: 'Online',
        city: '',
        state: '',
        country: '',
        awardDetails: '',
        certificate: null,
        eventReport: null,
        photograph: '',
        participants: [initialParticipant],
    });


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData((prev) => ({ ...prev, [name]: files[0] }));
    };

    const handleParticipantChange = (index, e) => {
        const { name, value } = e.target;
        const updated = [...formData.participants];
        updated[index][name] = value;
        setFormData((prev) => ({ ...prev, participants: updated }));
    };

    const addParticipant = () => {
        setFormData((prev) => ({
            ...prev,
            participants: [...prev.participants, JSON.parse(JSON.stringify(initialParticipant))],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formPayload = new FormData();

        // Append basic fields
        formPayload.append('title', formData.title);
        formPayload.append('date', formData.date);
        formPayload.append('organizer', formData.organizer);
        formPayload.append('mode', formData.mode);

        if (formData.mode === 'Offline' || formData.mode === 'Hybrid') {
            formPayload.append('city', formData.city);
            formPayload.append('state', formData.state);
            formPayload.append('country', formData.country);
        }

        formPayload.append('awardDetails', formData.awardDetails);

        // Append participants as JSON string
        formPayload.append('participants', JSON.stringify(formData.participants));

        // Append files
        if (formData.certificate) formPayload.append('certificate', formData.certificate);
        if (formData.eventReport) formPayload.append('eventReport', formData.eventReport);
        if (formData.photograph) formPayload.append('photograph', formData.photograph);

        try {
            const url = isEditing
                ? `http://localhost:5000/api/extra-curricular/${editData.id}`
                : `http://localhost:5000/api/extra-curricular`;
            const method = isEditing ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method: method,
                body: formPayload,
            });

            const result = await response.json();

            if (response.ok) {
                alert('Extra Curricular details submitted successfully');
                // Optionally clear form
                setFormData({
                    title: '',
                    date: '',
                    organizer: '',
                    mode: 'Online',
                    city: '',
                    state: '',
                    country: '',
                    awardDetails: '',
                    certificate: null,
                    eventReport: null,
                    photograph: '',
                    participants: [initialParticipant],
                });
                navigate('/hod/student');
                setCertificateURL(null);
                setEventURL(null);
            } else {
                alert(`Submission failed: ${result.error}`);
            }
        } catch (err) {
            console.error('Submit Error:', err);
            alert('An error occurred during submission.');
        }
    };


    return (
        <>
            <form className="student-form" onSubmit={handleSubmit}>
                {/* <h2>Extra Curricular Form</h2> */}
                <div className="form-row">
                    <label className='required'>Title of Event</label>
                    <input value={formData.title} name='title' type="text" onChange={handleChange} required />
                    <label className='required'>Date</label>
                    <input value={formData.date} name='date' type="date" onChange={handleChange} required />
                </div>
                <div className="form-row">
                    <label className='required'>Organizer</label>
                    <input value={formData.organizer} name='organizer' type="text" onChange={handleChange} required />
                    <label className='required'>Mode</label>
                    <select value={formData.mode} name="mode" onChange={handleChange}>
                        <option value='Online'>Online</option>
                        <option value='Offline'>Offline</option>
                        <option value='Hybrid'>Hybrid</option>
                    </select>
                </div>
                {(formData.mode === 'Offline' || formData.mode === 'Hybrid') && (
                    <div className="form-group">
                        <label className='required'>Place</label>
                        <div className="form-row">
                            <input name='city' value={formData.city} onChange={handleChange} type="text" placeholder="City" required />
                            <input name='state' value={formData.state} onChange={handleChange} type="text" placeholder="State" required />
                            <input name='country' value={formData.country} onChange={handleChange} type="text" placeholder="Country" required />
                        </div>
                    </div>
                )}
                <div className="form-group">
                    {formData.participants.map((p, idx) => (
                        <div key={idx} className="participant">
                            {idx > 0 && <div style={{ marginBottom: '15px' }} className="separator">_______________________________________________</div>}
                            <label>Participant {idx + 1} Details:</label>
                            <div className="form-row">
                                <label className='required'>Name</label>
                                <input onChange={(e) => handleParticipantChange(idx, e)} name='firstName' value={p.firstName} type="text" placeholder="First Name" required />
                                <input onChange={(e) => handleParticipantChange(idx, e)} name='middleName' value={p.middleName} type="text" placeholder="Middle Name" />
                                <input onChange={(e) => handleParticipantChange(idx, e)} name='lastName' value={p.lastName} type="text" placeholder="Last Name" required />
                            </div>
                            <div className="form-row">
                                <label className='required'>Gender</label>
                                <select value={p.gender} onChange={(e) => handleParticipantChange(idx, e)} name="gender" required>
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                                <label className='required'>Programme</label>
                                <select value={p.programme} onChange={(e) => handleParticipantChange(idx, e)} name="programme" required>
                                    <option value="">Select</option>
                                    <option value="B.Tech.">B.Tech.</option>
                                    <option value="B.Tech. - M.Tech.">B.Tech. - M.Tech.</option>
                                    <option value="M.Tech.">M.Tech.</option>
                                    <option value="M.S.(By Research)">M.S.(By Research)</option>
                                    <option value="M.Sc.">M.Sc.</option>
                                    <option value="PhD">PhD</option>
                                </select>
                            </div>
                            <div className="form-row">
                                <label className='required'>Roll No.</label>
                                <input onChange={(e) => handleParticipantChange(idx, e)} name='rollNo' value={p.rollNo} type="text" placeholder="Roll No" required />
                                <label className='required'>Department</label>
                                <select value={p.department} onChange={(e) => handleParticipantChange(idx, e)} name="department" required>
                                    <option>CSE</option>
                                    <option>CCE</option>
                                    <option>ECE</option>
                                    <option>MME</option>
                                    <option>Mathematics</option>
                                    <option>Physics</option>
                                    <option>HSS</option>
                                </select>
                                {/* <input onChange={(e) => handleParticipantChange(idx, e)} name='department' value={p.department} type="text" placeholder="Department" /> */}
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addParticipant}>Add Participant</button>
                </div>
                <div className="form-row">
                    <label>Award Details</label>
                    <input name='awardDetails' type="text" value={formData.awardDetails} onChange={handleChange} />
                </div>

                <div className="form-row">
                    {certificateURL && (
                        <>
                            <label>Upload Certificate</label>
                            <input name="certificate" onChange={handleFileChange} type="file" />
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
                            <label>Upload Certificate</label>
                            <input style={{maxWidth:'50%'}} name="certificate" onChange={handleFileChange} type="file" />
                        </>
                    )}
                </div>
                <div className="form-row" style={{width:'100%'}}>
                    {eventURL && (
                        <>
                            <label>Upload Event Report</label>
                            <input name="eventReport" onChange={handleFileChange} type="file" />
                            <div className="existing-certificate" style={{ display: 'flex', gap: '2rem' }}>
                                <p style={{ fontWeight: 'bold' }}>Existing Certificate:</p>
                                <a style={{ alignSelf: 'center' }} href={eventURL} target="_blank" rel="noopener noreferrer">
                                    View Certificate
                                </a>
                            </div>
                        </>
                    )}

                    {!eventURL && (
                        <>
                            <label>Upload Event Report</label>
                            <input style={{maxWidth:'50%'}} name="eventReport" onChange={handleFileChange} type="file" />
                        </>
                    )}
                </div>

                <div className="form-row">
                    <label className='required'>Link for Photograph</label>
                    <input value={formData.photograph} type="url" name="photograph" onChange={handleChange} required />
                    {/* <input name="photograph" onChange={handleFileChange} type="file" /> */}
                </div>
                <button type="submit" className="submit-btn">Submit</button>
            </form>
        </>
    );
};

export default ExtraCurricular;