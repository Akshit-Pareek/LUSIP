import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import './PaperReviews.css';

const PaperReviews = () => {
    const location = useLocation();
    const editData = location.state ? location.state.data : null;
    const isEditing = !!editData;
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        type: 'Journal',
        firstName: '',
        middleName: '',
        lastName: '',
        nameOfPublication: '',
        abbreviation: '',
        numberOfPapers: '',
        month: ''
    });

    useEffect(() => {
        if (editData) {
           setFormData({
                type: editData.type || 'Journal',
                firstName: editData.first_name || '',
                middleName: editData.middle_name || '',
                lastName: editData.last_name || '',
                nameOfPublication: editData.name_of_publication || '',
                abbreviation: editData.abbreviation || '',
                numberOfPapers: editData.number_of_papers || '',
                month: editData.month ? editData.month.slice(0, 7) : ''
            });
        }
    }, [editData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const url = isEditing
                ? `http://localhost:5000/api/paper-reviews/${editData.id}`
                : `http://localhost:5000/api/paper-reviews`;
            const method = isEditing ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to submit form');
            }

            alert('Paper review submitted successfully!');
            // Optionally reset the form
            setFormData({
                type: 'Journal',
                firstName: '',
                middleName: '',
                lastName: '',
                nameOfPublication: '',
                abbreviation: '',
                numberOfPapers: '',
                month: ''
            });
            navigate('/hod/paper-reviews');

        } catch (err) {
            console.error('Submission error:', err);
            alert('Error submitting paper review. Please try again.');
        }
    };

    return (
        <div className="paper-reviews-form">
            {/* <h2>Paper Reviews</h2> */}
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <label>
                        Type:
                        <select name="type" value={formData.type} onChange={handleChange} required>
                            <option value="Journal">Journal</option>
                            <option value="Conference">Conference</option>
                        </select>
                    </label>

                    <label>
                        Name of Journal/Conference:
                        <input type="text" name="nameOfPublication" value={formData.nameOfPublication} onChange={handleChange} required />
                    </label>
                </div>

                <div className="form-row">
                    <label>
                        Abbreviation:
                        <input type="text" name="abbreviation" value={formData.abbreviation} onChange={handleChange} />
                    </label>

                    <label>
                        Number of Papers:
                        <input type="number" name="numberOfPapers" value={formData.numberOfPapers} onChange={handleChange} required />
                    </label>
                </div>

                <fieldset className="name-group">
                    <legend>Name of Faculty</legend>
                    <div className="form-row">
                        <label>
                            First Name:
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                        </label>

                        <label>
                            Middle Name:
                            <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} />
                        </label>
                        <label>
                            Last Name:
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                        </label>
                    </div>
                </fieldset>

                <div className="form-row" style={{ width: '50%' }}>
                    <label>
                        Month of Review:
                        <input style={{ marginTop: '5px', border: '0.2px solid grey', padding: '5px' }} type="month" name="month" value={formData.month} onChange={handleChange} required />
                    </label>
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default PaperReviews;
