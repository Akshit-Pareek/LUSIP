import React, { useState } from 'react';
import './EditDetails.css';
import { useNavigate } from 'react-router-dom';

const columnConfig = {
    'Faculty Info': ['employee_id', 'name', 'email', 'department'],
    'Publication': ['title', 'type', 'year'],
    'Expert Talk': ['name', 'title', 'event', 'organizer', 'city'],
    'Event Attended': ['type_of_event', 'title', 'organizer', 'from_date'],
    'Event Organized': ['type', 'mode', 'title', 'organizer', 'numParticipants'],
    'Student': ['name', 'roll_no', 'programme', 'department'], //but names are taken from json as first name last name represented as a single column in table
    'Faculty': ['name', 'email', 'designation', 'department'],//but names are taken from json as first name last name  represented as a single column in table
    'Project/Patent/MoU': ['name', 'type', 'funding_type', 'duration'],
    'MoU': ['organization_name', 'start_date', 'end_date'],
    'Paper Reviews': ['type', 'name', 'Name of Publication', 'Month'],
};


const tabConfig = {
    'Faculty Info': 'First Name',
    'Publication': 'Year',
    'Expert Talk': 'First Name',
    'Event Attended': 'Title',
    'Event Organized': 'Title',
    'Student': 'First Name',
    'Faculty': 'First Name/Event Name',
    'Project/Patent/MoU': 'Name',
    'Paper Reviews': 'First Name',
};

const EditDetails = () => {
    const [selectedTab, setSelectedTab] = useState('');
    const [StudentTab, setStudentTab] = useState('');
    const [FacultyTab, setFacultyTab] = useState('');
    const [ProjectTab, setProjectTab] = useState('');
    const [searchField, setSearchField] = useState('');
    const [results, setResults] = useState([]);
    const navigate = useNavigate();

    const renderTabTable = (tab, results) => {
        switch (tab) {
            case 'Faculty Info': return renderFacultyInfo(results);
            case 'Publication': return renderPublication(results);
            case 'Expert Talk': return renderExpertTalk(results);
            case 'Event Attended': return renderEventAttended(results);
            case 'Event Organized': return renderEventOrganized(results);
            case 'Student': return renderStudent(results);
            case 'Faculty': return renderFaculty(results);
            case 'Project/Patent/MoU': return renderProjectPatentMou(results);
            case 'Paper Reviews': return renderPaperReviews(results);
            default: return null;
        }
    };

    const renderTableRows = (rows, columns, transformFn) => (
        rows.map((row, idx) => (
            <tr key={idx}>
                <td>
                    <button onClick={() => handleEdit(row)}>Edit</button>
                </td>
                {columns.map((col, i) => (
                    <td key={i}>
                        {transformFn ? transformFn(row[col], row, col) : row[col]}
                    </td>
                ))}
            </tr>
        ))
    );

    // Faculty Info
    const renderFacultyInfo = (results) => {

        const columns = columnConfig['Faculty Info'];
        return (
            <table>
                <thead>
                    <tr>
                        <th>EDIT</th>
                        {columns.map(col => <th key={col}>{col.toUpperCase().replace(/_/g, ' ')}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {results.map((row, idx) => (
                        <tr key={idx}>
                            <td>
                                <button onClick={() => handleEdit(row)}>Edit</button>
                            </td>
                            {columns.map((col, i) => (
                                <td key={i}>
                                    {col === 'name'
                                        ? `${row.first_name || ''} ${row.middle_name || ''} ${row.last_name || ''}`.replace(/\s+/g, ' ').trim()
                                        : (row[col] ? row[col] : 'N/A    ')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    // Publication
    const renderPublication = (results) => {
        const columns = columnConfig['Publication'];
        return (
            <table>
                <thead>
                    <tr>
                        <th>EDIT</th>
                        {columns.map(col => <th key={col}>{col.toUpperCase().replace(/_/g, ' ')}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {renderTableRows(results, columns)}
                </tbody>
            </table>
        );
    };

    // Expert Talk
    const renderExpertTalk = (results) => {
        const columns = columnConfig['Expert Talk'];
        return (
            <table>
                <thead>
                    <tr>
                        <th>EDIT</th>
                        {columns.map(col => <th key={col}>{col.toUpperCase().replace(/_/g, ' ')}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {results.map((row, idx) => (
                        <tr key={idx}>
                            <td>
                                <button onClick={() => handleEdit(row)}>Edit</button>
                            </td>
                            {columns.map((col, i) => (
                                <td key={i}>
                                    {col === 'name'
                                        ? `${row.firstName || ''} ${row.middleName || ''} ${row.lastName || ''}`.replace(/\s+/g, ' ').trim()
                                        : (row[col] ? row[col] : 'N/A    ')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    // Event Organized
    const renderEventOrganized = (results) => {
        const columns = columnConfig['Event Organized'];
        return (
            <table>
                <thead>
                    <tr>
                        <th>EDIT</th>
                        {columns.map(col => <th key={col}>{col.toUpperCase().replace(/_/g, ' ')}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {renderTableRows(results, columns)}
                </tbody>
            </table>
        );
    };

    // Event Attended
    const renderEventAttended = (results) => {
        const columns = columnConfig['Event Attended'];
        return (
            <table>
                <thead>
                    <tr>
                        <th>EDIT</th>
                        {columns.map(col => <th key={col}>{col.toUpperCase().replace(/_/g, ' ')}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {results.map((row, idx) => (
                        <tr key={idx}>
                            <td>
                                <button onClick={() => handleEdit(row)}>Edit</button>
                            </td>
                            {columns.map((col, i) => (
                                <td key={i}>
                                    {col === 'from_date'
                                        ? `${String(row.from_date).split('T')[0]}`//.replace(/\s+/g, ' ').trim()
                                        : (row[col] ? row[col] : 'N/A')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };


    // Student (name from JSON)
    const renderStudent = (results) => {
        const renderExtraCurricular = (results) => {
            return (
                <table>
                    <thead>
                        <tr>
                            <th>EDIT</th>
                            <th>PARTICIPANT NAMES</th>
                            <th>EVENT TITLE</th>
                            <th>ORGANIZER</th>
                            <th>LOCATION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((row, idx) => {
                            const names = Array.isArray(row.participants)
                                ? row.participants.map(p => [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ')).join(', ')
                                : '';
                            return (
                                <tr key={idx}>
                                    <td><button onClick={() => handleEdit(row)}>Edit</button></td>
                                    <td>{names}</td>
                                    <td>{row.title}</td>
                                    <td>{row.organizer}</td>
                                    <td>{row.city}, {row.state}, {row.country}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            );
        };
        const renderInternship = (results) => {
            return (
                <table>
                    <thead>
                        <tr>
                            <th>EDIT</th>
                            <th>STUDENT NAME</th>
                            <th>ROLL NO</th>
                            <th>COMPANY</th>
                            <th>TYPE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((row, idx) => {
                            return (
                                <tr key={idx}>
                                    <td><button onClick={() => handleEdit(row)}>Edit</button></td>
                                    <td>{row.firstName} {row.middleName ? row.middleName : ''} {row.lastName}</td>
                                    <td>{row.rollNo}</td>
                                    <td>{row.internshipType}</td>
                                    <td>{row.companyName}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            );
        };
        const renderPlacement = (results) => {
            return (
                <table>
                    <thead>
                        <tr>
                            <th>EDIT</th>
                            <th>Name</th>
                            <th>ROLL NO</th>
                            <th>COMPANY</th>
                            <th>PACKAGE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((row, idx) => (
                            <tr key={idx}>
                                <td><button onClick={() => handleEdit(row)}>Edit</button></td>
                                <td>{row.firstName} {row.middleName ? row.middleName : ''} {row.lastName}</td>
                                <td>{row.rollNo}</td>
                                <td>{row.companyName}</td>
                                <td>{row.package} LPA</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        };
        const renderCompetitiveExam = (results) => {
            return (
                <table>
                    <thead>
                        <tr>
                            <th>EDIT</th>
                            <th>Name</th>
                            <th>ROLL NO</th>
                            <th>EXAM</th>
                            <th>QUALIFICATION YEAR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((row, idx) => (
                            <tr key={idx}>
                                <td><button onClick={() => handleEdit(row)}>Edit</button></td>
                                <td>{row.firstName} {row.middleName ? row.middleName : ''} {row.lastName}</td>
                                <td>{row.rollNo}</td>
                                <td>{row.examName}</td>
                                <td>{row.yearOfQualification}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        };
        const renderHigherEducation = (results) => {
            return (
                <table>
                    <thead>
                        <tr>
                            <th>EDIT</th>
                            <th>NAME</th>
                            <th>PROGRAM</th>
                            <th>DEPARTMENT</th>
                            <th>INSTITUTE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((row, idx) => (
                            <tr key={idx}>
                                <td><button onClick={() => handleEdit(row)}>Edit</button></td>
                                <td>{row.first_name} {row.middle_name ? row.middle_name : ''} {row.last_name}</td>
                                <td>{row.admitted_programme}</td>
                                <td>{row.department}</td>
                                <td>{row.institute}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        };
        const renderBTPDetails = (results) => {
            return (
                <table>
                    <thead>
                        <tr>
                            <th>EDIT</th>
                            <th>PROJECT TITLE</th>
                            <th>STUDENTS</th>
                            <th>SUPERVISORS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((row, idx) => {
                            // If you want to use participants, declare names here (currently not used in table)
                            // const names = Array.isArray(row.participants)
                            //     ? row.participants.map(p => [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ')).join(', ')
                            //     : '';
                            return (
                                <tr key={idx}>
                                    <td><button onClick={() => handleEdit(row)}>Edit</button></td>
                                    <td>{row.title}</td>
                                    <td>{Array.isArray(row.students) ? row.students.map(s => `${s.firstName} ${s.lastName}`).join(', ') : ''}</td>
                                    <td>{Array.isArray(row.supervisors) ? row.supervisors.map(s => `${s.firstName} ${s.lastName}`).join(', ') : ''}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            );
        };
        const renderPaperPresentation = (results) => {
            return (
                <table>
                    <thead>
                        <tr>
                            <th>EDIT</th>
                            <th>PAPER TITLE</th>
                            <th>NAME</th>
                            <th>EVENT</th>
                            <th>LOCATION</th>
                            <th>DATE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((row, idx) => (
                            <tr key={idx}>
                                <td><button onClick={() => handleEdit(row)}>Edit</button></td>
                                <td>{row.paperTitle}</td>
                                <td>{row.firstName}{row.middleName ? ` ${row.middleName}` : ''} {row.lastName}</td>
                                <td>{row.eventTitle}</td>
                                <td>{row.venueCity},{row.venueState}, {row.venueCountry}</td>
                                <td>{String(row.fromDate).split('T')[0]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        };

        if (StudentTab === 'Extra Curricular') {
            return renderExtraCurricular(results);
        }
        if (StudentTab === 'Internships') {
            return renderInternship(results);
        }
        if (StudentTab === 'Placement') {
            return renderPlacement(results);
        }
        if (StudentTab === 'Competitive Exam') {
            return renderCompetitiveExam(results);
        }
        if (StudentTab === 'Higher Education') {
            return renderHigherEducation(results);
        }
        if (StudentTab === 'BTP Details') {
            return renderBTPDetails(results);
        }
        if (StudentTab === 'Paper Presentation') {
            return renderPaperPresentation(results);
        }


        const columns = columnConfig['Student'];
        console.log(results)
        return (
            <>

                <table>
                    <thead>
                        <tr>
                            <th>EDIT</th>
                            {columns.map(col => <th key={col}>{col.toUpperCase().replace(/_/g, ' ')}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {renderTableRows(results, columns, (val, row, col) => {
                            if (col === 'name' && typeof row.student_json === 'string') {
                                try {
                                    const parsed = JSON.parse(row.student_json);
                                    return `${parsed.firstname} ${parsed.lastname}`;
                                } catch (e) {
                                    return '';
                                }
                            }
                            return val;
                        })}
                    </tbody>
                </table>
            </>
        );
    };

    // Faculty (name from JSON)
    const renderFaculty = (results) => {
        const columns = columnConfig['Faculty'];
        const renderOutreach = (results) => {
            return (
                <table>
                    <thead>
                        <tr>
                            <th>EDIT</th>
                            <th>CATEGORY</th>
                            <th>EVENT NAME</th>
                            <th>FROM DATE</th>
                            <th>LOCATION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((row, idx) => (
                            <tr key={idx}>
                                <td><button onClick={() => handleEdit(row)}>Edit</button></td>
                                <td>{row.outreach_category}</td>
                                <td>{row.outreach_event_name}</td>
                                <td>{String(row.outreach_from).split('T')[0]}</td>
                                <td>{row.outreach_venue_city}, {row.outreach_venue_state}, {row.outreach_venue_country}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        if (FacultyTab === 'Outreach') {
            return renderOutreach(results);
        }
        return (
            <table>
                <thead>
                    <tr>
                        <th>EDIT</th>
                        <th>SECTION</th>
                        <th>NAME</th>
                        <th>DEPARTMENT</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((row, idx) => (
                        <tr key={idx}>
                            <td><button onClick={() => handleEdit(row)}>Edit</button></td>
                            <td>{row.section}</td>
                            <td>{row.first_name} {row.middle_name ? row.middle_name : ''} {row.last_name}</td>
                            <td>{row.department}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    // Project/Patent/MoU
    const renderProjectPatentMou = (results) => {
        const columns = columnConfig['Project/Patent/MoU'];

        const renderResearchAndDevelopment = (results) => {
            return (
                <table>
                    <thead>
                        <tr>
                            <th>EDIT</th>
                            <th>PI NAME</th>
                            <th>TITLE</th>
                            <th>DURATION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((row, idx) => (
                            <tr key={idx}>
                                <td><button onClick={() => handleEdit(row)}>Edit</button></td>
                                <td>
                                    {row.pi_name
                                        ? (Array.isArray(row.pi_name)
                                            ? row.pi_name.map(s => `${s.firstName || ''} ${s.middleName || ''} ${s.lastName || ''}`.replace(/\s+/g, ' ').trim()).join(', ')
                                            : `${row.pi_name.firstName || ''} ${row.pi_name.middleName || ''} ${row.pi_name.lastName || ''}`.replace(/\s+/g, ' ').trim()
                                        )
                                        : ''
                                    }
                                </td>
                                <td>{row.title}</td>
                                <td>{row.duration}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        const renderConsultancy = (results) => {
            return (
                <table>
                    <thead>
                        <tr>
                            <th>EDIT</th>
                            <th>FACULTY IN-CHARGE</th>
                            <th>TITLE</th>
                            <th>DURATION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((row, idx) => (
                            <tr key={idx}>
                                <td><button onClick={() => handleEdit(row)}>Edit</button></td>
                                <td>
                                    {row.faculty_in_charge
                                        ? (Array.isArray(row.faculty_in_charge)
                                            ? row.faculty_in_charge.map(s => `${s.firstName || ''} ${s.middleName || ''} ${s.lastName || ''}`.replace(/\s+/g, ' ').trim()).join(', ')
                                            : `${row.faculty_in_charge.firstName || ''} ${row.faculty_in_charge.middleName || ''} ${row.faculty_in_charge.lastName || ''}`.replace(/\s+/g, ' ').trim()
                                        )
                                        : ''
                                    }
                                </td>
                                <td>{row.title}</td>
                                <td>{row.duration}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        const renderPatent = (results) => {
            return (
                <table>
                    <thead>
                        <tr>
                            <th>EDIT</th>
                            <th>INVENTORS</th>
                            <th>TITLE</th>
                            <th>MONTH</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((row, idx) => (
                            <tr key={idx}>
                                <td><button onClick={() => handleEdit(row)}>Edit</button></td>
                                <td>
                                    {row.inventors
                                        ? (Array.isArray(row.inventors)
                                            ? row.inventors.map(s => `${s.firstName || ''} ${s.middleName || ''} ${s.lastName || ''}`.replace(/\s+/g, ' ').trim()).join(', ')
                                            : `${row.inventors.firstName || ''} ${row.inventors.middleName || ''} ${row.inventors.lastName || ''}`.replace(/\s+/g, ' ').trim()
                                        )
                                        : ''
                                    }
                                </td>
                                <td>{row.title}</td>
                                <td>{row.patent_month}-{row.patent_year}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        const renderMoU = (results) => {
            return (
                <table>
                    <thead>
                        <tr>
                            <th>EDIT</th>
                            <th>ORGANIZATION NAME</th>
                            <th>ORGANIZATION SECTOR</th>
                            <th>SIGNED ON DATE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((row, idx) => (
                            <tr key={idx}>
                                <td><button onClick={() => handleEdit(row)}>Edit</button></td>
                                <td>{row.organizationName}</td>
                                <td>{row.organizationSector}</td>
                                <td>{String(row.signedOnDate).split('T')[0]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        if (ProjectTab === 'Research and Development') {
            return renderResearchAndDevelopment(results);
        }
        if (ProjectTab === 'Consultancy') {
            return renderConsultancy(results);
        }
        if (ProjectTab === 'Patent') {
            return renderPatent(results);
        }
        if (ProjectTab === 'MoU') {
            return renderMoU(results);
        }
    };

    // Paper Reviews
    const renderPaperReviews = (results) => {
        const columns = columnConfig['Paper Reviews'];
        return (
            <table>
                <thead>
                    <tr>
                        <th>EDIT</th>
                        {columns.map(col => <th key={col}>{col.toUpperCase().replace(/_/g, ' ')}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {/* 'Paper Reviews': ['type','name', 'Name of Pub.','Month'], */}
                    {results.map((row, idx) => (
                        <tr key={idx}>
                            <td><button onClick={() => handleEdit(row)}>Edit</button></td>
                            <td>{row.type}</td>
                            <td>{row.first_name} {row.middle_name} {row.last_name}</td>
                            <td>{row.name_of_publication}</td>
                            <td>{row.month}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };


    const handleSearch = async () => {
        if (!selectedTab || !searchField) return alert('Select a tab and enter a search value.');

        try {
            const res = await fetch(`http://localhost:5000/api/edit/${selectedTab === 'Student' ? StudentTab : (selectedTab === 'Faculty' ? FacultyTab : (selectedTab === 'Project/Patent/MoU' ? ProjectTab : selectedTab))}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: searchField }),
            });

            const data = await res.json();
            if (data.success) {
                setResults(data.entries);
                if (data.entries.length <= 0) alert("No search results found!");
                console.log('Search results:', data.entries);
            } else {
                alert(data.error || 'No results found');
            }
        } catch (err) {
            console.error('Search error:', err);
            alert('Server error');
        }
    };

    const handleEdit = (entryData) => {
        if (selectedTab === 'Project/Patent/MoU') setSelectedTab('Project_Patent_MoU');
        // ...existing code...
        const ProjPatMouTab = 'project_patent_mou';
        navigate(`/hod/${selectedTab !== 'Project/Patent/MoU' ? (selectedTab.toLowerCase().replace(/\s/g, '-')) : ProjPatMouTab}`, {
            state:
                selectedTab === 'Student'
                    ? { data: entryData, type: StudentTab }
                    : selectedTab === 'Faculty'
                        ? { data: entryData }
                        : selectedTab === 'Project/Patent/MoU'
                            ? { data: entryData, type: ProjectTab }
                            : { data: entryData }
        });
    };


    // const handleEdit = (entryId) => {
    //     // Navigate to edit route with tab and ID

    //     navigate(`/edit/${selectedTab.toLowerCase().replace(/\s/g, '_')}/${entryId}`);
    // };

    const column = tabConfig[selectedTab] || 'value';

    // State to store all entries (unfiltered)
    const [allEntries, setAllEntries] = useState([]);

    // Fetch all entries when tab/subtab changes
    React.useEffect(() => {
        if (!selectedTab) {
            setAllEntries([]);
            setResults([]);
            return;
        }
        // Determine API endpoint based on tab/subtab
        const tabKey =
            selectedTab === 'Student'
                ? StudentTab
                : selectedTab === 'Faculty'
                    ? FacultyTab
                    : selectedTab === 'Project/Patent/MoU'
                        ? ProjectTab
                        : selectedTab;

        if (!tabKey && (selectedTab === 'Student' || selectedTab === 'Faculty' || selectedTab === 'Project/Patent/MoU')) {
            setAllEntries([]);
            setResults([]);
            return;
        }

        // Fetch all entries for the selected tab/subtab
        fetch(`http://localhost:5000/api/edit/${tabKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: '' }), // empty value to fetch all
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAllEntries(data.entries);
                    setResults([]); // clear filtered results
                } else {
                    setAllEntries([]);
                    setResults([]);
                }
            })
            .catch(() => {
                setAllEntries([]);
                setResults([]);
            });
    }, [selectedTab, StudentTab, FacultyTab, ProjectTab]);

    return (
        <div className="edit-details-container">
            <h2>Edit Records</h2>

            <div className="form-row">
                <label>Select Field</label>
                <select value={selectedTab} onChange={(e) => { setSelectedTab(e.target.value); setResults([]); setSearchField(''); setAllEntries([]); }}>
                    <option value="">-- Select Tab --</option>
                    {Object.keys(tabConfig).map((tab, i) => (
                        <option key={i} value={tab}>{tab === 'Faculty Info' ? 'Faculty Information' : tab}</option>
                    ))}
                </select>
            </div>

            {selectedTab && (
                <>
                    {(selectedTab === 'Student') && (
                        <div className="form-row">
                            <label>Type</label>
                            <select value={StudentTab} onChange={(e) => { setStudentTab(e.target.value); setResults([]); setSearchField(''); }}>
                                <option value="">-- Select Tab --</option>
                                {['Extra Curricular', 'Internships', 'Placement', 'Competitive Exam', 'Higher Education', 'BTP Details', 'Paper Presentation'].map(tab => (
                                    <option key={tab} value={tab}>{tab}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {(selectedTab === 'Faculty') && (
                        <div className="form-row">
                            <label>Type</label>
                            <select value={FacultyTab} onChange={(e) => { setFacultyTab(e.target.value); setResults([]); setSearchField(''); }}>
                                <option value="">-- Select Tab --</option>
                                {['Outreach', 'Others'].map(tab => (
                                    <option key={tab} value={tab}>{tab}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {(selectedTab === 'Project/Patent/MoU') && (
                        <div className="form-row">
                            <label>Category</label>
                            <select value={ProjectTab} onChange={(e) => { setProjectTab(e.target.value); setResults([]); setSearchField(''); }}>
                                <option value="">-- Select Tab --</option>
                                {['Research and Development', 'Consultancy', 'Patent', 'MoU'].map(tab => (
                                    <option key={tab} value={tab}>{tab}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="form-row">
                        <label>Search By {column}</label>
                        <input
                            value={searchField}
                            onChange={(e) => setSearchField(e.target.value)}
                            placeholder={ProjectTab === '' ? `Enter ${column}` : 'Name of Principal Investigator/Faculty in-charge/Inventor/Organization'}
                        />
                        <button className="search-btn" onClick={handleSearch}>Search</button>
                        {results.length > 0 && (
                            <button
                                className="search-btn"
                                style={{ marginLeft: 8 }}
                                onClick={() => { setResults([]); setSearchField(''); }}
                            >
                                Show All
                            </button>
                        )}
                    </div>
                </>
            )}

            {(allEntries.length > 0 || results.length > 0) && (
                <div className="results-table">
                    {renderTabTable(selectedTab, results.length > 0 ? results : allEntries)}
                </div>
            )}
        </div>
    );
};



export default EditDetails;
