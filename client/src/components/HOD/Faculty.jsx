import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import './Faculty.css';

const Faculty = () => {
    const [section, setSection] = useState('');
    const [yearOptions, setYearOptions] = useState([]);
    const location = useLocation();
    const editData = location.state ? location.state.data : null;
    const isEditing = !!editData;
    const navigate = useNavigate();
    const [awardURL, setAwardURL] = useState(null);
    const [paperURL, setPaperURL] = useState(null);
    const [outURL, setOutURL] = useState(null);

    useEffect(() => {
        const generateAcademicYears = () => {
            const startYear = 2002;
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth();
            const endYear = currentMonth >= 7 ? currentYear + 1 : currentYear;

            const years = [];
            for (let y = startYear; y < endYear; y++) {
                years.push(`${y}-${(y + 1).toString().slice(2)}`);
            }
            setYearOptions(years.reverse());
        };
        generateAcademicYears();

        if (editData) {
            setSection(editData.section || '');
            setFormData(prev => ({
                ...prev,
                firstName: editData.first_name || '',
                middleName: editData.middle_name || '',
                lastName: editData.last_name || '',
                department: editData.department || 'CSE',
                designation: editData.designation || 'Assistant Professor',
                awardDetail: editData.award_detail || '',
                awardingAgency: editData.awarding_agency || '',
                awardCertificate: null,
                awardDate: editData.awardDate ? editData.awardDate.split('T')[0] : '',
                photoLink: editData.photo_link || '',
                programme: editData.programme || '',
                mainSupervisorCount: editData.main_supervisor_count || '',
                coSupervisorCount: editData.co_supervisor_count || '',
                guided_year: editData.guided_year || '',
                courseName: editData.course_name || '',
                courseCode: editData.course_code || '',
                courseLevel: editData.course_level || '',
                year: editData.year || '',
                paperTitle: editData.paper_title || '',
                eventMode: editData.event_mode || '',
                sponsoringAgency: editData.sponsoring_agency || '',
                eventTitle: editData.event_title || '',
                eventAbbreviation: editData.event_abbreviation || '',
                fundedByInstitute: editData.funded_by_institute || '',
                amountFunded: editData.amount_funded || '',
                organizer: editData.organizer || '',
                venueCity: editData.venue_city || '',
                venueState: editData.venue_state || '',
                venueCountry: editData.venue_country || '',
                fromDate: editData.from_date || '',
                toDate: editData.to_date || '',
                achievement: editData.achievement || '',
                paperCertificate: null,
                outreachCategory: editData.outreach_category || '',
                outreachEventName: editData.outreach_event_name || '',
                outreachAbbreviation: editData.outreach_abbreviation || '',
                outreachAgency: editData.outreach_agency || '',
                outreachVenueCity: editData.outreach_venue_city || '',
                outreachVenueState: editData.outreach_venue_state || '',
                outreachVenueCountry: editData.outreach_venue_country || '',
                outreachFrom: editData.outreach_from || '',
                outreachTo: editData.outreach_to || '',
                outreachCertificate: null,
            }));
            if (editData.award_certificate) {
                const relativePath = editData.award_certificate.split('\\').pop(); // replace Windows backslashes
                const encodedPath = encodeURIComponent(relativePath);
                setAwardURL(`http://localhost:5000/uploads/Faculty/${encodedPath}`);
                console.log('Certificate URL:', `http://localhost:5000/uploads/Faculty/${encodedPath}`);
            }
            else {
                setAwardURL(null);
            }
            if (editData.paper_certificate) {
                const relativePath = editData.paper_certificate.split('\\').pop(); // replace Windows backslashes
                const encodedPath = encodeURIComponent(relativePath);
                setPaperURL(`http://localhost:5000/uploads/Faculty/${encodedPath}`);
                console.log('Certificate URL:', `http://localhost:5000/uploads/Faculty/${encodedPath}`);
            }
            else {
                setPaperURL(null);
            }
            if (editData.outreach_certificate) {
                const relativePath = editData.outreach_certificate.split('\\').pop(); // replace Windows backslashes
                const encodedPath = encodeURIComponent(relativePath);
                setOutURL(`http://localhost:5000/uploads/Faculty/${encodedPath}`);
                console.log('Certificate URL:', `http://localhost:5000/uploads/Faculty/${encodedPath}`);
            }
            else {
                setOutURL(null);
            }
        }
    }, [editData]);

    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        department: 'CSE',
        designation: 'Assistant Professor',

        // Awards
        awardDetail: '',
        awardingAgency: '',
        awardCertificate: null,
        photoLink: '',
        awardDate: '',

        // Guided
        programme: '',
        mainSupervisorCount: '',
        coSupervisorCount: '',
        guided_year: '',

        // Course
        courseName: '',
        courseCode: '',
        courseLevel: '',
        year: '',

        // Paper
        paperTitle: '',
        eventMode: '',
        sponsoringAgency: '',
        eventTitle: '',
        eventAbbreviation: '',
        fundedByInstitute: '',
        amountFunded: '',
        organizer: '',
        venueCity: '',
        venueState: '',
        venueCountry: '',
        fromDate: '',
        toDate: '',
        achievement: '',
        paperCertificate: null,

        // Outreach
        outreachCategory: '',
        outreachEventName: '',
        outreachAbbreviation: '',
        outreachAgency: '',
        outreachVenueCity: '',
        outreachVenueState: '',
        outreachVenueCountry: '',
        outreachFrom: '',
        outreachTo: '',
        outreachCertificate: null,
    });

    const handleChange = e => {
        const { name, value, files, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'file' ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
        const data = new FormData();

        // Basic info
        data.append('section', section);
        data.append('firstName', formData.firstName);
        data.append('middleName', formData.middleName);
        data.append('lastName', formData.lastName);
        data.append('department', formData.department);
        data.append('designation', formData.designation);

        // Awards
        if (section === 'awards') {

            data.append('awardDetail', formData.awardDetail);
            data.append('awardingAgency', formData.awardingAgency);
            data.append('awardDate', formData.awardDate);
            if (formData.awardCertificate) {
                data.append('awardCertificate', formData.awardCertificate);
            }
            data.append('photoLink', formData.photoLink);
        }

        // Guided
        if (section === 'guided') {
            data.append('programme', formData.programme);
            if (formData.mainSupervisorCount !== '' && formData.mainSupervisorCount !== undefined) {
                data.append('mainSupervisorCount', formData.mainSupervisorCount);
            }
            if (formData.coSupervisorCount !== '' && formData.coSupervisorCount !== undefined) {
                data.append('coSupervisorCount', formData.coSupervisorCount);
            }
            data.append('guided_year', formData.guided_year);
        }

        // New Course
        if (section === 'course') {
            data.append('courseName', formData.courseName);
            data.append('courseCode', formData.courseCode);
            data.append('courseLevel', formData.courseLevel);
            data.append('year', formData.year);
        }

        // Paper Presentation
        if (section === 'paper') {
            data.append('paperTitle', formData.paperTitle);
            data.append('eventMode', formData.eventMode);
            data.append('sponsoringAgency', formData.sponsoringAgency);
            data.append('eventTitle', formData.eventTitle);
            data.append('eventAbbreviation', formData.eventAbbreviation);
            data.append('fundedByInstitute', formData.fundedByInstitute);
            if (formData.amountFunded !== '' && formData.amountFunded !== undefined) {
                data.append('amountFunded', formData.amountFunded);
            }
            data.append('organizer', formData.organizer);
            data.append('venueCity', formData.venueCity);
            data.append('venueState', formData.venueState);
            data.append('venueCountry', formData.venueCountry);
            data.append('fromDate', formData.fromDate);
            data.append('toDate', formData.toDate);
            data.append('achievement', formData.achievement);
            if (formData.paperCertificate) {
                data.append('paperCertificate', formData.paperCertificate);
            }

        }

        // Outreach
        if (section === 'outreach') {

            data.append('outreachCategory', formData.outreachCategory);
            data.append('outreachEventName', formData.outreachEventName);
            data.append('outreachAbbreviation', formData.outreachAbbreviation);
            data.append('outreachAgency', formData.outreachAgency);
            data.append('outreachVenueCity', formData.outreachVenueCity);
            data.append('outreachVenueState', formData.outreachVenueState);
            data.append('outreachVenueCountry', formData.outreachVenueCountry);
            data.append('outreachFrom', formData.outreachFrom);
            data.append('outreachTo', formData.outreachTo);
            if (formData.outreachCertificate) {
                data.append('outreachCertificate', formData.outreachCertificate);
            }
        }

        try {
            const url = isEditing
                ? `http://localhost:5000/api/faculty/${editData.id}`
                : `http://localhost:5000/api/faculty`;
            const method = isEditing ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method: method,
                body: data
            });

            if (res.ok) {
                alert('Faculty data submitted successfully.');
                // Optionally reset formData here
                setFormData({
                    firstName: '',
                    middleName: '',
                    lastName: '',
                    department: 'CSE',
                    designation: 'Assistant Professor',
                    awardDetail: '',
                    awardingAgency: '',
                    awardCertificate: null,
                    awardDate: '',
                    photoLink: '',
                    programme: '',
                    mainSupervisorCount: '',
                    coSupervisorCount: '',
                    guided_year: '',
                    courseName: '',
                    courseCode: '',
                    courseLevel: '',
                    year: '',
                    paperTitle: '',
                    eventMode: '',
                    sponsoringAgency: '',
                    eventTitle: '',
                    eventAbbreviation: '',
                    fundedByInstitute: '',
                    amountFunded: '',
                    organizer: '',
                    venueCity: '',
                    venueState: '',
                    venueCountry: '',
                    fromDate: '',
                    toDate: '',
                    achievement: '',
                    paperCertificate: null,
                    outreachCategory: '',
                    outreachEventName: '',
                    outreachAbbreviation: '',
                    outreachAgency: '',
                    outreachVenueCity: '',
                    outreachVenueState: '',
                    outreachVenueCountry: '',
                    outreachFrom: '',
                    outreachTo: '',
                    outreachCertificate: null,
                });
                navigate('/hod/faculty');
                setAwardURL(null);
                setPaperURL(null);
                setOutURL(null);
            } else {
                const errMsg = await res.text();
                alert('Submission failed: ' + errMsg);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Error submitting data.');
        }
    };


    return (
        <form className="faculty-form" onSubmit={handleSubmit}>
            {/* <h2>Faculty Contribution Form</h2> */}

            <div className="form-row" style={{ width: '49%' }}>
                <label>Section</label>
                <select value={section} onChange={e => setSection(e.target.value)}>
                    <option value="">-- Select Section --</option>
                    <option value="awards">Awards/Recognition/Fellowship</option>
                    <option value="guided">PhD/M.Tech./M.S./M.Sc. Guided</option>
                    <option value="course">New Course Developed</option>
                    <option value="paper">Paper Presentation</option>
                    <option value="outreach">Outreach</option>
                </select>
            </div>

            {(section !== 'outreach' && section) && (
                <>
                    <div className="form-row">
                        <label>Name</label>
                        <input placeholder='First Name' name="firstName" value={formData.firstName} onChange={handleChange} />
                        <input placeholder='Middle Name' name="middleName" value={formData.middleName} onChange={handleChange} />
                        <input placeholder='Last Name' name="lastName" value={formData.lastName} onChange={handleChange} />
                    </div>
                    <div className="form-row" style={(section === 'paper') ? { width: '49%' } : {}}>
                        <label>Department</label>
                        <select value={formData.department} onChange={handleChange} name="department" required>
                            <option>CSE</option>
                            <option>CCE</option>
                            <option>ECE</option>
                            <option>MME</option>
                            <option>Mathematics</option>
                            <option>Physics</option>
                            <option>HSS</option>
                        </select>
                        {section !== 'paper' && (
                            <>
                                <label>Designation</label>
                                <select name="designation" value={formData.designation} onChange={handleChange} required>
                                    <option>Assistant Professor</option>
                                    <option>Associate Professor</option>
                                    <option>Professor</option>
                                </select>
                            </>
                        )}
                    </div>
                </>
            )}

            {section === 'awards' && (
                <>
                    {/* <h3>Awards / Recognition / Fellowship</h3> */}
                    <div className="form-row">
                        <label>Award Detail</label>
                        <input name="awardDetail" value={formData.awardDetail} onChange={handleChange} />
                        <label>Awarding Agency</label>
                        <input name="awardingAgency" value={formData.awardingAgency} onChange={handleChange} />
                    </div>
                    <div className="form-row">
                        <label>Award Date</label>
                        <input
                            name="awardDate"
                            type="date"
                            value={formData.awardDate}
                            onChange={handleChange}
                        />
                        <label>Link for Photograph</label>
                        <input name="photoLink" type='url' value={formData.photoLink} onChange={handleChange} />
                    </div>

                    {awardURL && (
                        <>
                            <div className="form-row">
                                <label>Upload Certificate</label>
                                <input type="file" name="awardCertificate" onChange={handleChange} />
                                <div className="existing-certificate" style={{ display: 'flex', gap: '2rem' }}>
                                    <p style={{ fontWeight: 'bold' }}>Existing Certificate:</p>
                                    <a style={{ alignSelf: 'center' }} href={awardURL} target="_blank" rel="noopener noreferrer">
                                        View Certificate
                                    </a>
                                </div>
                            </div>
                        </>
                    )}

                    {!awardURL && (
                        <>
                            <div className="form-row" style={{ width: '49%' }}>
                                <label style={{ width: '20%' }}>Upload Certificate</label>
                                <input style={{ width: '150%' }} type="file" name="awardCertificate" onChange={handleChange} />
                            </div>
                        </>
                    )}
                </>
            )}

            {section === 'guided' && (
                <>
                    {/* <h3>PhD/M.Tech./M.S./M.Sc. Guided</h3> */}
                    <div className="form-row">
                        <label>Programme</label>
                        <select name="programme" value={formData.programme} onChange={handleChange}>
                            <option value="">Select</option>
                            <option>M.Tech.</option>
                            <option>M.S.</option>
                            <option>M.Sc.</option>
                            <option>PhD</option>
                        </select>
                        <label className='required'>Academic Year</label>
                        <select
                            name="guided_year"
                            value={formData.guided_year}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Year</option>
                            {yearOptions.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-row">
                        <label>No. of Main Supervisor</label>
                        <input name="mainSupervisorCount" type="number" value={formData.mainSupervisorCount} onChange={handleChange} />
                        <label>No. of Co-Supervisor</label>
                        <input name="coSupervisorCount" type="number" value={formData.coSupervisorCount} onChange={handleChange} />
                    </div>
                </>
            )}

            {section === 'course' && (
                <>
                    {/* <h3>New Course Developed</h3> */}
                    <div className="form-row">
                        <label>Course Name</label>
                        <input name="courseName" value={formData.courseName} onChange={handleChange} />
                        <label>Course Code</label>
                        <input name="courseCode" value={formData.courseCode} onChange={handleChange} />
                    </div>
                    <div className="form-row">
                        <label className='required'>Academic Year</label>
                        <select
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Year</option>
                            {yearOptions.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                        <label>Level</label>
                        <select name="courseLevel" value={formData.courseLevel} onChange={handleChange}>
                            <option value="">--Select--</option>
                            {[...Array(7)].map((_, i) => (
                                <option key={i} value={`Level ${i + 1}`}>Level {i + 1}</option>
                            ))}
                        </select>
                    </div>
                </>
            )
            }

            {
                section === 'paper' && (
                    <>
                        {/* <h3>Paper Presentation</h3> */}
                        <div className="form-row">
                            <label>Paper Title</label>
                            <input name="paperTitle" value={formData.paperTitle} onChange={handleChange} />
                            <label>Mode of Event</label>
                            <select name="eventMode" value={formData.eventMode} onChange={handleChange}>
                                <option value="">Select</option>
                                <option>Offline</option>
                                <option>Online</option>
                                <option>Hybrid</option>
                            </select>
                        </div>
                        <div className="form-row">
                            <label>Sponsoring Agency</label>
                            <input name="sponsoringAgency" value={formData.sponsoringAgency} onChange={handleChange} />
                            <label>Title of Event</label>
                            <input name="eventTitle" value={formData.eventTitle} onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <label>Abbreviation of Event</label>
                            <input name="eventAbbreviation" value={formData.eventAbbreviation} onChange={handleChange} />
                            <label>Funded by Institute</label>
                            <select name="fundedByInstitute" value={formData.fundedByInstitute} onChange={handleChange}>
                                <option value="">Select</option>
                                <option>Yes</option>
                                <option>No</option>
                            </select>
                        </div>
                        {formData.fundedByInstitute === 'Yes' && (
                            <div className="form-row">
                                <label>Amount Funded (₹)</label>
                                <input name="amountFunded" type="number" value={formData.amountFunded} onChange={handleChange} />
                                <label>Organizer</label>
                                <input name="organizer" value={formData.organizer} onChange={handleChange} />
                            </div>
                        )}
                        {formData.fundedByInstitute === 'No' && (
                            <div className="form-row" style={{ width: '49%' }}>
                                <label>Organizer</label>
                                <input name="organizer" value={formData.organizer} onChange={handleChange} />
                            </div>
                        )}
                        <div className="form-row">
                            <label>Venue</label>
                            <input placeholder='City' name="venueCity" value={formData.venueCity} onChange={handleChange} />
                            <input placeholder='State' name="venueState" value={formData.venueState} onChange={handleChange} />
                            <input placeholder='Country' name="venueCountry" value={formData.venueCountry} onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <label>From Date</label>
                            <input name="fromDate" type="date" value={formData.fromDate} onChange={handleChange} />
                            <label>To Date</label>
                            <input name="toDate" type="date" value={formData.toDate} onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <label>Achievement<br></br>(if any)</label>
                            <input name="achievement" value={formData.achievement} onChange={handleChange} />
                            {paperURL && (
                                <>
                                    <label>Upload Certificate</label>
                                    <input type="file" name="paperCertificate" onChange={handleChange} />
                                    <div className="existing-certificate" style={{ display: 'flex', gap: '2rem' }}>
                                        <p style={{ fontWeight: 'bold' }}>Existing Certificate:</p>
                                        <a style={{ alignSelf: 'center' }} href={paperURL} target="_blank" rel="noopener noreferrer">
                                            View Certificate
                                        </a>
                                    </div>
                                </>
                            )}

                            {!paperURL && (
                                <>
                                    <label>Upload Certificate</label>
                                    <input type="file" name="paperCertificate" onChange={handleChange} />
                                </>
                            )}
                        </div>
                    </>
                )
            }

            {
                section === 'outreach' && (
                    <>
                        {/* <h3>Outreach</h3> */}
                        <div className="form-row">
                            <label>Category</label>
                            <select name="outreachCategory" value={formData.outreachCategory} onChange={handleChange}>
                                <option value="">Select</option>
                                <option>Session Chair</option>
                                <option>Program Committee Member</option>
                                <option>Chair/Co-Chair</option>
                                <option>Others</option>
                            </select>
                            <label>Name of Event</label>
                            <input name="outreachEventName" value={formData.outreachEventName} onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <label>Abbreviation of Event</label>
                            <input name="outreachAbbreviation" value={formData.outreachAbbreviation} onChange={handleChange} />
                            <label>Organizing Agency</label>
                            <input name="outreachAgency" value={formData.outreachAgency} onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <label>Venue</label>
                            <input placeholder='City' name="outreachVenueCity" value={formData.outreachVenueCity} onChange={handleChange} />
                            <input placeholder='State' name="outreachVenueState" value={formData.outreachVenueState} onChange={handleChange} />
                            <input placeholder='Country' name="outreachVenueCountry" value={formData.outreachVenueCountry} onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <label>From Date</label>
                            <input name="outreachFrom" type="date" value={formData.outreachFrom} onChange={handleChange} />
                            <label>To Date</label>
                            <input name="outreachTo" type="date" value={formData.outreachTo} onChange={handleChange} />
                        </div>
                        <div className="form-row" style={{ width: '49%' }}>
                            {outURL && (
                                <>
                                    <label>Upload Certificate</label>
                                    <input type="file" name="outreachCertificate" onChange={handleChange} />
                                    <div className="existing-certificate" style={{ display: 'flex', gap: '2rem' }}>
                                        <p style={{ fontWeight: 'bold' }}>Existing Certificate:</p>
                                        <a style={{ alignSelf: 'center' }} href={outURL} target="_blank" rel="noopener noreferrer">
                                            View Certificate
                                        </a>
                                    </div>
                                </>
                            )}

                            {!outURL && (
                                <>
                                    <label>Upload Certificate</label>
                                    <input type="file" name="outreachCertificate" onChange={handleChange} />
                                </>
                            )}
                        </div>
                    </>
                )
            }

            {
                section && (
                    <div className="form-row">
                        <button type="submit" className="submit-btn">Submit</button>
                    </div>
                )
            }
        </form >
    );
};

export default Faculty;
