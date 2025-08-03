import React, { useEffect, useState } from 'react';
import './AnnualReport.css';

const AnnualReport = () => {
    const [yearOptions, setYearOptions] = useState([]);
    const [category, setCategory] = useState('');
    const [quarter, setQuarter] = useState('');
    const [formData, setFormData] = useState({
        academicYear: '',
        wordFile: null,
        pdfFile: null
    });

    // Generate academic years dynamically based on today's date
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
    }, []);

    const handleChange = (e) => {
        const { name, value, files, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'file' ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submission = new FormData();
        submission.append('academicYear', formData.academicYear);
        submission.append('category', category);
        if (category === 'Quarterly Newsletter') {
            submission.append('quarter', quarter);
        }
        if (formData.wordFile) submission.append('wordFile', formData.wordFile);

        try {
            const res = await fetch('http://localhost:5000/api/annual-report', {
                method: 'POST',
                body: submission
            });
            const data = await res.json();
            if (data.success) {
                alert('Report submitted!');
                setFormData({ academicYear: '', wordFile: null });
                setCategory('');
                setQuarter('');
            } else {
                alert('Submission failed.');
            }
        } catch (err) {
            console.error(err);
            alert('Server error.');
        }
    };

    return (
        <form className="annual-report-form" onSubmit={handleSubmit}>
            <div className="form-row">
                <label>Academic Year</label>
                <select name="academicYear" value={formData.academicYear} onChange={handleChange} required>
                    <option value="">-- Select Academic Year --</option>
                    {yearOptions.map((year, i) => (
                        <option key={i} value={year}>{year}</option>
                    ))}
                </select>

                <label>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} required>
                    <option value="">-- Select Category --</option>
                    <option>Convocation Report</option>
                    <option>Department Report</option>
                    <option>Centre Report</option>
                    <option>Quarterly Newsletter</option>
                </select>
            </div>

            {category === 'Quarterly Newsletter' && (
                <div className="form-row">
                    <label>Quarter</label>
                    <select value={quarter} onChange={e => setQuarter(e.target.value)} required>
                        <option value="">-- Select Quarter --</option>
                        <option>Quarter 1</option>
                        <option>Quarter 2</option>
                        <option>Quarter 3</option>
                        <option>Quarter 4</option>
                    </select>
                </div>
            )}

            <div className="form-row">
                <label>Upload Report</label>
                <input type="file" name="wordFile" accept=".pdf,.doc,.docx" onChange={handleChange} required />
            </div>

            <div className="form-row">
                <button type="submit" className="submit-btn">Submit</button>
            </div>
        </form>
    );
};

export default AnnualReport;
