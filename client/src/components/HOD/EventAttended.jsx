import React, { useState } from 'react';
import './EventAttended.css';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const EventAttended = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        typeOfEvent: 'National/International Summer Term Programme',
        sponsoringAgency: '',
        title: '',
        abbreviation: '',
        organizer: '',
        city: '',
        state: '',
        country: '',
        fromDate: '',
        toDate: '',
        certificate: null,
    });
    const [certificateURL, setCertificateURL] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, certificate: e.target.files[0] }));
    };

    const location = useLocation();
    const editData = location.state ? location.state.data : null;
    const isEditing = !!editData;
    // console.log('Edit Data:', editData);
    useEffect(() => {
        if (!editData) return;
        if (editData) {
            // Step 1: Set form data (excluding membership)
            setFormData({
                typeOfEvent: editData.type_of_event || 'National/International Summer Term Programme',
                sponsoringAgency: editData.sponsoring_agency || '',
                title: editData.title || '',
                abbreviation: editData.abbreviation || '',
                organizer: editData.organizer || '',
                city: editData.city || '',
                state: editData.state || '',
                country: editData.country || '',
                fromDate: editData.from_date ? (editData.from_date).split('T')[0] : '',
                toDate: editData.to_date ? (editData.to_date).split('T')[0] : '',
                certificate: null // File input will be handled separately
            });
            if (editData.certificate_path) {
                const relativePath = editData.certificate_path.split('\\').pop(); // replace Windows backslashes
                const encodedPath = encodeURIComponent(relativePath);
                setCertificateURL(`http://localhost:5000/uploads/EventAttended/${encodedPath}`);
                console.log('Certificate URL:', `http://localhost:5000/uploads/EventAttended/${encodedPath}`);
            }
            else {
                setCertificateURL(null);
            }
        }
    }, [editData]);


    const resetForm = (e) => {
        setFormData(
            {
                typeOfEvent: 'National/International Summer Term Programme',
                sponsoringAgency: '',
                title: '',
                abbreviation: '',
                organizer: '',
                city: '',
                state: '',
                country: '',
                fromDate: '',
                toDate: '',
                certificate: null
            }
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'certificate') {
                if (formData.certificate) {
                    data.append('certificate', formData.certificate);
                } else {
                    data.append('certificate', null);
                }
            } else {
                data.append(key, formData[key]);
            }
        });

        try {
            const url = isEditing
                ? `http://localhost:5000/api/event-attended/${editData.id}`
                : `http://localhost:5000/api/event-attended`;
            const method = isEditing ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method: method,
                body: data,
            });
            if (!res.ok) throw new Error(await res.text());
            resetForm();
            navigate('/hod/event-attended');
            setCertificateURL(null);
            alert('Event submitted successfully!');
        } catch (err) {
            console.error('Submission error:', err);
            alert('Failed to submit event');
        }
    };

    return (
        <div className="events-form">
            {/* <h2>Events Attended</h2> */}
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="form-row">
                    <label>
                        Type of Event
                        <select name="typeOfEvent" value={formData.typeOfEvent} onChange={handleChange} required>
                            <option>National/International Summer Term Programme</option>
                            <option>Short Term Training Programme</option>
                            <option>Industrial Training Programme</option>
                            <option>Certificate Course</option>
                            <option>Workshop</option>
                            <option>Finishing School</option>
                            <option>Faculty Development Programme</option>
                            <option>Administrative Development Programme</option>
                            <option>Executive Development Programme</option>
                            <option>MOOC Course</option>
                        </select>
                    </label>

                    <label>
                        <span className="required">Sponsoring Agency</span>
                        <input type="text" name="sponsoringAgency" value={formData.sponsoringAgency} onChange={handleChange} />
                    </label>
                </div>

                <div className="form-row">
                    <label>
                        <span className="required">Title of Event</span>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                    </label>

                    <label>
                        <span>Abbreviation</span>
                        <input type="text" name="abbreviation" value={formData.abbreviation} onChange={handleChange} />
                    </label>
                </div>

                <div className="form-row">
                    <label>
                        <span className="required">Organizer</span>
                        <input type="text" name="organizer" value={formData.organizer} onChange={handleChange} required />
                    </label>

                    <label>
                        <span className="required">Upload Certificate</span>
                        {/* <input type="file" accept=".pdf,.jpg,.png,.jpeg" onChange={handleFileChange} required /> */}
                        {certificateURL && (
                            <>
                                <input style={{ marginTop: '20px', height: '100px'}} type="file" accept=".pdf,.jpg,.png,.jpeg" onChange={handleFileChange} />
                                <div className="existing-certificate" style={{ display: 'flex', gap: '2rem' }}>
                                    <p style={{ fontWeight: 'bold' }}>Existing Certificate:</p>
                                    <a style={{ alignSelf: 'center' }} href={certificateURL} target="_blank" rel="noopener noreferrer">
                                        View Certificate
                                    </a>
                                </div>
                            </>
                        )}

                        {!certificateURL && (
                            <input style={{ marginTop: '20px'}} type="file" accept=".pdf,.jpg,.png,.jpeg" onChange={handleFileChange} required />
                        )}
                    </label>
                </div>

                <fieldset className="grid-item full venue-group">
                    <legend>Venue</legend>
                    <div className="sub-grid">
                        <div>
                            <label className='required' style={{ marginRight: '10px' }}>City</label>
                            <input style={{ height: '10px' }} type="text" name="city" value={formData.city} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className='required' style={{ marginRight: '10px' }}>State</label>
                            <input style={{ height: '10px' }} type="text" name="state" value={formData.state} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className='required' style={{ marginRight: '10px' }}>Country</label>
                            <input style={{ height: '10px' }} type="text" name="country" value={formData.country} onChange={handleChange} required />
                        </div>
                    </div>
                </fieldset>

                <div className="form-row">
                    <label>
                        <span className="required">From</span>
                        <input type="date" name="fromDate" value={formData.fromDate} onChange={handleChange} required />
                    </label>

                    <label>
                        <span className="required">To</span>
                        <input type="date" name="toDate" value={formData.toDate} onChange={handleChange} required />
                    </label>
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default EventAttended;
