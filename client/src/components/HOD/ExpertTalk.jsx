import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import './ExpertTalk.css';

const ExpertTalk = () => {
    const [formData, setFormData] = useState({
        salutation: '',
        firstName: '',
        middleName: '',
        lastName: '',
        typeOfTalk: 'Inside LNMIIT',
        title: '',
        event: '',
        organizer: '',
        city: '',
        state: '',
        country: '',
        dates: [''],
        certificate: null,
    });
    const navigate = useNavigate();

    const [certificateURL, setCertificateURL] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (index, value) => {
        const updatedDates = [...formData.dates];
        updatedDates[index] = value;
        setFormData(prev => ({ ...prev, dates: updatedDates }));
    };

    const addDateField = () => {
        setFormData(prev => ({ ...prev, dates: [...prev.dates, ''] }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, certificate: e.target.files[0] }));
    };

    const fileInputRef = useRef(null);
    const resetForm = () => {
        setFormData({
            salutation: '',
            firstName: '',
            middleName: '',
            lastName: '',
            typeOfTalk: 'Inside LNMIIT',
            title: '',
            event: '',
            organizer: '',
            city: '',
            state: '',
            country: '',
            dates: [''],
            certificate: null,
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const location = useLocation();
    const editData = location.state ? location.state.data : null;
    const isEditing = !!editData;

    useEffect(() => {
        if (editData) {
            const conv = editData.dates
                ? editData.dates.map(date => date.slice(0, 10))
                : [''];
            setFormData({
                salutation: editData.salutation || '',
                firstName: editData.firstName || '',
                middleName: editData.middleName || '',
                lastName: editData.lastName || '',
                typeOfTalk: editData.type_of_talk || 'Inside LNMIIT',
                title: editData.title || '',
                event: editData.event || '',
                organizer: editData.organizer || '',
                city: editData.city || '',
                state: editData.state || '',
                country: editData.country || '',
                dates: conv,
                certificate: null,
            });
            if (editData.certificate_path) {
                const relativePath = editData.certificate_path.split('\\').pop();
                const encodedPath = encodeURIComponent(relativePath);
                setCertificateURL(`http://localhost:5000/uploads/ExpertTalks/${encodedPath}`);
            }
            else {
                setCertificateURL(null);
            }

            const fetchDates = async () => {
                try {
                    const res = await fetch(`http://localhost:5000/api/expert-talks/dates/${editData.id}`);
                    const data = await res.json();
                    if (data.success && Array.isArray(data.data.dates)) {
                        const converted = data.data.dates.map(date => date.talk_date.slice(0, 10));
                        setFormData(prev => ({
                            ...prev,
                            dates: converted,
                        }));
                    }
                } catch (error) {
                    console.error("Failed to fetch dates:", error);
                }
            };

            fetchDates();
        }
    }, [editData]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('salutation', formData.salutation);
        data.append('firstName', formData.firstName);
        data.append('middleName', formData.middleName);
        data.append('lastName', formData.lastName);
        data.append('typeOfTalk', formData.typeOfTalk);
        data.append('title', formData.title);
        data.append('event', formData.event);
        data.append('organizer', formData.organizer);
        data.append('city', formData.city);
        data.append('state', formData.state);
        data.append('country', formData.country);

        formData.dates.forEach((date, idx) => {
            data.append(`dates[${idx}]`, date);
        });

        if (formData.certificate) {
            data.append('certificate', formData.certificate);
        }
        else {
            data.append('certificate', null);
        }

        try {
            const url = isEditing
                ? `http://localhost:5000/api/expert-talks/${editData.id}`
                : `http://localhost:5000/api/expert-talks`;
            const method = isEditing ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method: method,
                body: data
            });
            if (!res.ok) throw new Error(await res.text());
            resetForm();
            navigate('/hod/expert-talk');
            setCertificateURL(null);
            alert(' Expert Talk submitted successfully!');
        } catch (err) {
            console.error('Submission error:', err);
            alert('Failed to submit Expert Talk');
        }
    };

    return (
        <div className="expert-talk-form">
            <h2></h2>
            <form className='form' onSubmit={handleSubmit} encType="multipart/form-data">
                <label className='grid-label'>
                    Category
                    <select name="typeOfTalk" value={formData.typeOfTalk} onChange={handleInputChange}>
                        <option>Inside LNMIIT</option>
                        <option>Outside LNMIIT</option>
                    </select>
                </label>

                <label className='grid-label'>
                    <span className="required">Title of Talk</span>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                </label>

                <label className='grid-label'>
                    <span className="required">Event Name</span>
                    <input type="text" name="event" value={formData.event} onChange={handleInputChange} required />
                </label>

                <label className='grid-label'>
                    <span className="required">Organizer</span>
                    <input type="text" name="organizer" value={formData.organizer} onChange={handleInputChange} required />
                </label>

                <div className="grid-lable">
                    <label className='required'>Date of Talk</label>
                    {formData.dates.map((date, idx) => (
                        <input
                            key={idx}
                            type="date"
                            value={date}
                            required={idx === 0}
                            onChange={(e) => handleDateChange(idx, e.target.value)}
                        />
                    ))}
                    <button type="button" onClick={addDateField}>Add Date</button>
                </div>

                <label className='grid-label'>
                    <span className="required">Upload Certificate</span>
                    {certificateURL && (
                        <>
                            <input style={{ marginTop: '20px', height: '100px', padding: '35px' }} type="file" accept=".pdf,.jpg,.png" onChange={handleFileChange} />
                            <div className="existing-certificate" style={{ display: 'flex', gap: '2rem' }}>
                                <p style={{ fontWeight: 'bold' }}>Existing Certificate:</p>
                                <a style={{ alignSelf: 'center' }} href={certificateURL} target="_blank" rel="noopener noreferrer">
                                    View Certificate
                                </a>
                            </div>
                        </>
                    )}

                    {!certificateURL && (
                        <input style={{ marginTop: '20px', height: '100px', padding: '35px' }} type="file" accept=".pdf,.jpg,.png" onChange={handleFileChange} required />
                    )}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <fieldset className="venue-group" style={{ marginBottom: '1.5rem', display: 'flex', gap: '20px', width:'200%' }}>
                        <legend>Speaker Details</legend>
                        <label>
                            <span className="required">Salutation</span>
                            <select name="salutation" value={formData.salutation} onChange={handleInputChange} required>
                                <option value="">Select</option>
                                <option>Dr.</option>
                                <option>Prof.</option>
                                <option>Mr.</option>
                                <option>Ms.</option>
                            </select>
                        </label>
                        <label>
                            <span className="required">First Name</span>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                        </label>
                        <label>
                            Middle Name
                            <input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} />
                        </label>
                        <label>
                            <span className="required">Last Name</span>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                        </label>
                    </fieldset>
                    <fieldset style={{ width: '200%' }} className="venue-group">
                        <legend>Venue</legend>

                        <label>
                            <span className="required">City</span>
                            <input type="text" name="city" value={formData.city} onChange={handleInputChange} required />
                        </label>

                        <label>
                            <span className="required">State</span>
                            <input type="text" name="state" value={formData.state} onChange={handleInputChange} required />
                        </label>

                        <label>
                            <span className="required">Country</span>
                            <input type="text" name="country" value={formData.country} onChange={handleInputChange} required />
                        </label>
                    </fieldset>
                    <button type="submit" style={{ width: '25%' }}>Submit</button>
                </div>
            </form>
        </div>
    );
};

export default ExpertTalk;
