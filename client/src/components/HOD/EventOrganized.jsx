import React, { useState } from 'react';
import './EventOrganized.css';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const EventOrganized = () => {
    const navigate = useNavigate();

    const [type, setType] = useState('Conference');
    const [mode, setMode] = useState('Offline');
    const [industry, setIndustry] = useState('');
    const [coordinators, setCoordinators] = useState([{ firstName: '', middleName: '', lastName: '', designation: 'Assistant Professor', department: 'CSE', organization: '' }]);
    const [speakers, setSpeakers] = useState([{ salutation: 'Prof', firstName: '', middleName: '', lastName: '', designation: '', organization: '' }]);
    const [formData, setFormData] = useState({
        sponsoringAgency: '',
        title: '',
        abbreviation: '',
        organizer: '',
        venue_city: '',
        venue_state: '',
        venue_country: '',
        from: '',
        to: '',
        numParticipants: '',
        poster: null,
        schedule: null,
        abstract: null,
        photoLink: ''
    });
    const [posterURL, setPosterURL] = useState(null);
    const [scheduleURL, setScheduleURL] = useState(null);
    const [abstractURL, setAbstractURL] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData(prev => ({ ...prev, [name]: files[0] }));
    };

    const addCoordinator = () => {
        setCoordinators(prev => [...prev, { firstName: '', middleName: '', lastName: '', designation: '', department: '', organization: '' }]);
    };

    const handleCoordinatorChange = (index, e) => {
        const { name, value } = e.target;
        const updated = [...coordinators];
        updated[index][name] = value;
        setCoordinators(updated);
    };

    const addSpeaker = () => {
        setSpeakers(prev => [...prev, { salutation: '', firstName: '', middleName: '', lastName: '', designation: '', organization: '' }]);
    };

    const handleSpeakerChange = (index, e) => {
        const { name, value } = e.target;
        const updated = [...speakers];
        updated[index][name] = value;
        setSpeakers(updated);
    };

    const resetForm = () => {
        setType('Conference');
        setMode('Offline');
        setCoordinators([{ firstName: '', middleName: '', lastName: '', designation: 'Assistant Professor', department: 'CSE', organization: '' }]);
        setSpeakers([{ salutation: 'Prof', firstName: '', middleName: '', lastName: '', designation: '', organization: '' }]);
        setFormData({
            sponsoringAgency: '',
            title: '',
            industry: '',
            abbreviation: '',
            organizer: '',
            venue_city: '',
            venue_state: '',
            venue_country: '',
            from: '',
            to: '',
            numParticipants: '',
            poster: null,
            schedule: null,
            abstract: null,
            photoLink: ''
        });
    };

    const location = useLocation();
    const editData = location.state ? location.state.data : null;
    const isEditing = !!editData;
    // console.log('Edit Data:', editData);
    useEffect(() => {
        if (!editData) return;
        if (editData) {
            // Step 1: Set form data (excluding membership)
            setType(editData.type || 'Conference');
            setMode(editData.mode || 'Offline');
            setIndustry(editData.industry || '');
            setCoordinators(
                Array.isArray(editData.coordinators) && editData.coordinators.length > 0
                    ? editData.coordinators.map(c => ({
                        firstName: c.firstName || '',
                        middleName: c.middleName || '',
                        lastName: c.lastName || '',
                        designation: c.designation || 'Assistant Professor',
                        department: c.department || 'CSE',
                        organization: c.organization || ''
                    }))
                    : [{ firstName: '', middleName: '', lastName: '', designation: 'Assistant Professor', department: 'CSE', organization: '' }]
            );
            setSpeakers(
                Array.isArray(editData.speakers) && editData.speakers.length > 0
                    ? editData.speakers.map(s => ({
                        salutation: s.salutation || 'Prof',
                        firstName: s.firstName || '',
                        middleName: s.middleName || '',
                        lastName: s.lastName || '',
                        designation: s.designation || '',
                        organization: s.organization || ''
                    }))
                    : [{ salutation: 'Prof', firstName: '', middleName: '', lastName: '', designation: '', organization: '' }]
            );
            setFormData(prev => ({
                ...prev,
                sponsoringAgency: editData.sponsoringAgency || '',
                title: editData.title || '',
                abbreviation: editData.abbreviation || '',
                organizer: editData.organizer || '',
                venue_city: editData.venue_city || '',
                venue_state: editData.venue_state || '',
                venue_country: editData.venue_country || '',
                from: editData.fromDate.slice(0, 10) || '',
                to: editData.toDate.slice(0, 10) || '',
                numParticipants: editData.numParticipants || '',
                poster: null,
                schedule: null,
                abstract: null,
                photoLink: editData.photoLink || ''
            }));

            if (editData.posterPath) {
                const relativePath = editData.posterPath.split('\\').pop(); // replace Windows backslashes
                const encodedPath = encodeURIComponent(relativePath);
                setPosterURL(`http://localhost:5000/uploads/EventOrganized/${encodedPath}`);
                console.log('Certificate URL:', `http://localhost:5000/uploads/EventOrganized/${encodedPath}`);
            }
            else {
                setPosterURL(null);
            }
            if (editData.schedulePath) {
                const relativePath = editData.schedulePath.split('\\').pop(); // replace Windows backslashes
                const encodedPath = encodeURIComponent(relativePath);
                setScheduleURL(`http://localhost:5000/uploads/EventOrganized/${encodedPath}`);
                console.log('Certificate URL:', `http://localhost:5000/uploads/EventOrganized/${encodedPath}`);
            }
            else {
                setScheduleURL(null);
            }
            if (editData.abstractPath) {
                const relativePath = editData.abstractPath.split('\\').pop(); // replace Windows backslashes
                const encodedPath = encodeURIComponent(relativePath);
                setAbstractURL(`http://localhost:5000/uploads/EventOrganized/${encodedPath}`);
                console.log('Certificate URL:', `http://localhost:5000/uploads/EventOrganized/${encodedPath}`);
            }
            else {
                setAbstractURL(null);
            }
        }
    }, [editData]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        data.append('type', type);

        if (type === 'Industrial Visit') {
            // For Industrial Visit
            data.append('mode', mode); // Here, mode is actually the industry name
            data.append('from', formData.from);
            data.append('to', formData.to);
            data.append('numParticipants', formData.numParticipants);
            data.append('photoLink', formData.photoLink);
        } else {
            // For all other types
            data.append('mode', mode);
            data.append('sponsoringAgency', formData.sponsoringAgency);
            data.append('title', formData.title);
            if (type !== 'Distinguished Lecture') {
                data.append('abbreviation', formData.abbreviation);
            }
            data.append('organizer', formData.organizer);

            // Venue details
            data.append('venue_city', formData.venue_city);
            data.append('venue_state', formData.venue_state);
            data.append('venue_country', formData.venue_country);

            data.append('from', formData.from);
            data.append('to', formData.to);
            data.append('numParticipants', formData.numParticipants);
            data.append('photoLink', formData.photoLink);

            // Files
            if (formData.poster) data.append('poster', formData.poster);
            if (type !== 'Distinguished Lecture' && formData.schedule) {
                data.append('schedule', formData.schedule);
            }
            if (type === 'Distinguished Lecture' && formData.abstract) {
                data.append('abstract', formData.abstract);
            }

            // Coordinators and speakers
            data.append('coordinators', JSON.stringify(coordinators));
            if (type === 'Distinguished Lecture') {
                data.append('speakers', JSON.stringify(speakers));
            }
        }

        // 4) Send to backend
        try {
            const url = isEditing
                ? `http://localhost:5000/api/event-organized/${editData.id}`
                : `http://localhost:5000/api/event-organized`;
            const method = isEditing ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                body: data
            });

            if (res.ok) alert('Form Submitted!');
            navigate('/hod/event-organized');
            setPosterURL(null);
            setScheduleURL(null);
            setAbstractURL(null);
            resetForm();
        } catch (err) {
            alert('Save failed');
            // throw new Error(await res.text());
            console.error('Error submitting publication:', err);
        }
    };

    return (
        <div className="event-organized-form">
            {/* <h2>Event Organized</h2> */}
            <form onSubmit={handleSubmit}>
                <div className="row">
                    <label>
                        <span className="required">Type of Event</span>
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            <option>Conference</option>
                            <option>Workshop</option>
                            <option>Seminar</option>
                            <option>Faculty Development Programme</option>
                            <option>Administrative Development Programme</option>
                            <option>Executive Development Programme</option>
                            <option>Short Term Training Programme</option>
                            <option>Distinguished Lecture</option>
                            <option>Industrial Visit</option>
                        </select>
                    </label>

                    <label>
                        <span className="required">{type !== 'Industrial Visit' ? 'Mode of Event' : 'Name of Industry'}</span>
                        {type !== 'Industrial Visit' ?
                            <select value={mode} onChange={(e) => setMode(e.target.value)}>
                                <option>Offline</option>
                                <option>Online</option>
                                <option>Hybrid</option>
                            </select>
                            :
                            <input onChange={(e) => setMode(e.target.value)} type="text" required />
                        }
                    </label>
                </div>
                {type !== 'Industrial Visit' ?
                    <>
                        <div className="row">
                            <label>
                                <span>Sponsoring Agency</span>
                                <input value={formData.sponsoringAgency} type="text" name="sponsoringAgency" onChange={handleChange} />
                            </label>
                            <label>
                                <span className="required">{type === 'Distinguished Lecture' ? 'Title of Lecture' : 'Title of Event'}</span>
                                <input value={formData.title} type="text" name="title" onChange={handleChange} required />
                            </label>
                        </div>

                        {type === 'Distinguished Lecture' && (
                            <>
                                <label>
                                    <span className="required">Speaker</span>
                                </label>
                                {speakers.map((s, idx) => (
                                    <div className="row sub-group" key={idx}>
                                        <select name="salutation" value={s.salutation} onChange={(e) => handleSpeakerChange(idx, e)}>
                                            <option>Prof</option>
                                            <option>Dr</option>
                                            <option>Mr</option>
                                            <option>Ms</option>
                                        </select>
                                        <input placeholder="First Name" name="firstName" value={s.firstName} onChange={(e) => handleSpeakerChange(idx, e)} required />
                                        <input placeholder="Middle Name" name="middleName" value={s.middleName} onChange={(e) => handleSpeakerChange(idx, e)} />
                                        <input placeholder="Last Name" name="lastName" value={s.lastName} onChange={(e) => handleSpeakerChange(idx, e)} required />
                                        <input placeholder="Designation" name="designation" value={s.designation} onChange={(e) => handleSpeakerChange(idx, e)} required />
                                        <input placeholder="Organization" name="organization" value={s.organization} onChange={(e) => handleSpeakerChange(idx, e)} required />
                                    </div>
                                ))}
                                <button style={{ marginTop: 0, marginBottom: '20px' }} type="button" onClick={addSpeaker}>Add Speaker</button>
                            </>
                        )}

                        <div className="row">
                            {(type !== 'Distinguished Lecture') ?
                                <label>
                                    <span>Abbreviation of Event</span>
                                    <input value={formData.abbreviation} type="text" name="abbreviation" onChange={handleChange} />
                                </label>
                                :
                                <></>
                            }
                            <label>
                                <span className="required">Organizer</span>
                                <input value={formData.organizer} type="text" name="organizer" onChange={handleChange} required />
                            </label>
                        </div>

                        <label>
                            <span className="required">Coordinator</span></label>
                        {coordinators.map((c, idx) => (
                            <div className="row sub-group" key={idx}>
                                <input placeholder="First Name" name="firstName" value={c.firstName} onChange={(e) => handleCoordinatorChange(idx, e)} required />
                                <input placeholder="Middle Name" name="middleName" value={c.middleName} onChange={(e) => handleCoordinatorChange(idx, e)} />
                                <input placeholder="Last Name" name="lastName" value={c.lastName} onChange={(e) => handleCoordinatorChange(idx, e)} required />
                                <select name="designation" value={c.designation} onChange={(e) => handleCoordinatorChange(idx, e)}>
                                    <option>Assistant Professor</option>
                                    <option>Associate Professor</option>
                                    <option>Professor</option>
                                </select>
                                <select style={{ width: '5rem' }} placeholder="Department" name="department" value={c.department} onChange={(e) => handleCoordinatorChange(idx, e)}>
                                    <option>CSE</option>
                                    <option>CCE</option>
                                    <option>ECE</option>
                                    <option>MME</option>
                                    <option>Mathematics</option>
                                    <option>Physics</option>
                                    <option>HSS</option>
                                </select>
                                <input value={c.organization} placeholder='Institute/Organization' type="text" onChange={(e) => handleCoordinatorChange(idx, e)} name='organization' required />
                            </div>
                        ))}
                        <button type="button" onClick={addCoordinator}>Add Coordinator</button>

                        <fieldset className="grid-item full venue-group">
                            <legend>Venue</legend>
                            <div className="sub-grid">
                                <div>
                                    <label style={{ marginRight: '10px' }}>
                                        <span className="required">City</span>
                                    </label>
                                    <input value={formData.venue_city} style={{ height: '10px' }} type="text" placeholder="City" name="venue_city" onChange={handleChange} required />
                                </div>
                                <div>
                                    <label style={{ marginRight: '10px' }}>
                                        <span className="required">State</span>
                                    </label>
                                    <input value={formData.venue_state} style={{ height: '10px' }} type="text" placeholder="State" name="venue_state" onChange={handleChange} required />
                                </div>
                                <div>
                                    <label style={{ marginRight: '10px' }}>
                                        <span className="required">Country</span>
                                    </label>
                                    <input value={formData.venue_country} style={{ height: '10px' }} type="text" placeholder="Country" name="venue_country" onChange={handleChange} required />
                                </div>
                            </div>
                        </fieldset>

                        <div className="row">
                            <label>
                                <span className="required">From</span>
                                <input value={formData.from} type="date" name="from" onChange={handleChange} required />
                            </label>
                            <label>
                                <span className="required">To</span>
                                <input value={formData.to} type="date" name="to" onChange={handleChange} required />
                            </label>
                        </div>

                        <div className="row">
                            <label>
                                <span className="required">Number of Participants</span>
                                <input value={formData.numParticipants} type="number" name="numParticipants" onChange={handleChange} required />
                            </label>
                            <label>
                                <span className="required">Link for Photos</span>
                                <input value={formData.photoLink} type="url" name="photoLink" onChange={handleChange} required />
                            </label>
                        </div>

                        <div className="row">
                            <>
                                {posterURL && (
                                    <>
                                        <label>Upload Poster<input type="file" name="poster" onChange={handleFileChange} /></label>
                                        <div className="existing-certificate" style={{ display: 'flex', gap: '2rem' }}>
                                            <p style={{ fontWeight: 'bold',alignSelf: 'flex-end' }}>Existing Certificate:</p>
                                            <a style={{ alignSelf: 'center' }} href={posterURL} target="_blank" rel="noopener noreferrer">
                                                View Certificate
                                            </a>
                                        </div>
                                    </>
                                )}

                                {!posterURL && (
                                    <label>Upload Poster<input type="file" name="poster" onChange={handleFileChange} /></label>
                                )}
                            </>
                        </div>
                        <div className="row">
                            <>
                                {type !== 'Distinguished Lecture' && (
                                    <>
                                        {scheduleURL && (
                                            <>
                                                <label>Upload Programme Schedule<input type="file" name="schedule" onChange={handleFileChange} /></label>
                                                <div className="existing-certificate" style={{ display: 'flex', gap: '2rem' }}>
                                                    <p style={{ fontWeight: 'bold',alignSelf: 'flex-end' }}>Existing Certificate:</p>
                                                    <a style={{ alignSelf: 'center' }} href={scheduleURL} target="_blank" rel="noopener noreferrer">
                                                        View Certificate
                                                    </a>
                                                </div>
                                            </>
                                        )}

                                        {!scheduleURL && (
                                            <label>Upload Programme Schedule<input type="file" name="schedule" onChange={handleFileChange} /></label>
                                        )}
                                    </>
                                )}
                                {type === 'Distinguished Lecture' && (
                                    <>
                                        {abstractURL && (
                                            <>
                                                <label>Upload Abstract<input type="file" name="abstract" onChange={handleFileChange} /></label>
                                                <div className="existing-certificate" style={{ display: 'flex', gap: '2rem' }}>
                                                    <p style={{ fontWeight: 'bold',alignSelf: 'flex-end' }}>Existing Certificate:</p>
                                                    <a style={{ alignSelf: 'center' }} href={abstractURL} target="_blank" rel="noopener noreferrer">
                                                        View Certificate
                                                    </a>
                                                </div>
                                            </>
                                        )}

                                        {!abstractURL && (
                                            <label>Upload Abstract<input type="file" name="abstract" onChange={handleFileChange} /></label>
                                        )}
                                    </>
                                )}
                            </>
                        </div>
                        </>
                        :
                        <>
                            <div className="row">
                                <label style={{ alignSelf: 'center' }}>Date of Visit</label>
                                <label>
                                    <span className="required">From</span>
                                    <input value={formData.from} type="date" name="from" onChange={handleChange} required />
                                </label>
                                <label>
                                    <span className="required">To</span>
                                    <input value={formData.to} type="date" name="to" onChange={handleChange} required />
                                </label>
                            </div>
                            <div className="row">
                                <label>
                                    <span className="required">Number of Participants</span>
                                    <input value={formData.numParticipants} type="number" name="numParticipants" onChange={handleChange} required />
                                </label>
                                <label>
                                    <span className="required">Link for Photos</span>
                                    <input value={formData.photoLink} type="url" name="photoLink" onChange={handleChange} required />
                                </label>
                            </div>

                        </>
                }
                        <button type="submit">Submit</button>
                    </form>
        </div>
    );
};

export default EventOrganized;
