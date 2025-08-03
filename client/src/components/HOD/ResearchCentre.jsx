import React, { useState, useEffect } from 'react';
import './ResearchCentre.css';

const ResearchCentre = ({ hodemail }) => {
    let department = hodemail.split('@')[0].replace('hod', '').toUpperCase();
    const [centres, setCentres] = useState([]);
    const [selectedCentre, setSelectedCentre] = useState('');
    const [centreForm, setCentreForm] = useState({ name: '', abbreviation: '' });

    const [formData, setFormData] = useState({
        centreName: '',
        eventName: '',
        poster: null,
        report: null,
        photoLink: ''
    });

    const fetchCentres = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/research-centres/${department}`);
            const data = await res.json();
            if (data.success) {
                setCentres(data.centres.map(c => `${c.name} (${c.abbreviation})`));
            }
        } catch (err) {
            console.error('Failed to fetch centres:', err);
        }
    };

    useEffect(() => {
        fetchCentres();
    }, [department]);

    const handleAddCentre = async () => {
        if (!centreForm.name || !centreForm.abbreviation) return alert('All fields required');

        try {
            const res = await fetch('http://localhost:5000/api/research-centres/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...centreForm, department }),
            });

            const data = await res.json();
            if (data.success) {
                alert('Centre added!');
                setCentreForm({ name: '', abbreviation: '' });
                fetchCentres(); // refresh list
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert('Server error while adding centre');
            console.error(err);
        }
    };
    const handleChange = (e) => {
        const { name, value, files, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'file' ? files[0] : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitting form with data:', formData);
        const submission = new FormData();
        submission.append('centreName', formData.centreName);
        submission.append('eventName', formData.eventName);
        if (formData.poster) submission.append('poster', formData.poster);
        submission.append('report', formData.report);
        submission.append('photoLink', formData.photoLink);
        submission.append('department', department);

        fetch('http://localhost:5000/api/research-centres', {
            method: 'POST',
            body: submission
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert('Submitted successfully!');
                    setFormData({
                        centreName: '',
                        eventName: '',
                        poster: null,
                        report: null,
                        photoLink: ''
                    });
                } else {
                    alert('Submission failed.');
                }
            })
            .catch(err => {
                console.error(err);
                alert('Server error.');
            });
    };

    return (
        <form className="research-form" onSubmit={handleSubmit}>
            {/* <h2>Research Centre Event Submission</h2> */}

            {/* Add Centre Section */}
            <div className="form-row">
                <fieldset>
                    <legend>Add New Research Centre</legend>
                    <div className="form-row" > 
                        <label>Centre Name</label>
                        <input
                            value={centreForm.name}
                            onChange={(e) => setCentreForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Centre for XYZ"
                        />
                        <label>Abbreviation</label>
                        <input
                            value={centreForm.abbreviation}
                            onChange={(e) => setCentreForm(prev => ({ ...prev, abbreviation: e.target.value }))}
                            placeholder="e.g., C-XYZ"
                        />
                    </div>
                </fieldset>
                <button type="button" className="submit-btn" onClick={handleAddCentre}>Add Centre</button>
            </div>

            {/* Main Form */}
            <fieldset>
                <legend>Add Event Report</legend>
                <div className="form-row">
                    <label>Centre Name</label>
                    <select style={{width:'100%'}} name="centreName" value={formData.centreName} onChange={handleChange}>
                        <option value="">-- Select Centre --</option>
                        {centres.map((centre, i) => (
                            <option key={i} value={centre}>{centre}</option>
                        ))}
                    </select>
                    <label>Event Name</label>
                    <input name="eventName" value={formData.eventName} onChange={handleChange} required />
                </div>

                <div className="form-row">
                    <label>Upload Poster (optional)</label>
                    <input type="file" name="poster" onChange={handleChange} accept=".pdf,.jpg,.jpeg,.png" />
                    <label>Upload Event Report</label>
                    <input type="file" name="report" onChange={handleChange} accept=".pdf" required />
                </div>

                <div className="form-row" style={{ width: '49%' }}>
                    <label>Link for Photographs</label>
                    <input type="url" name="photoLink" value={formData.photoLink} onChange={handleChange} />
                </div>
            </fieldset>
            <div className="form-row">
                <button type="submit" className="submit-btn">Submit</button>
            </div>
        </form >
    );
};

export default ResearchCentre;
