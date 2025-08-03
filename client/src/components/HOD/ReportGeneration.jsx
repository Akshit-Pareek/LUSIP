import React, { useEffect, useState } from 'react';
import './ReportGeneration.css';

const tabOptions = [
  'Faculty Info',
  'Publications',
  'Expert Talks',
  'Event Organized',
  'Event Attended',
  'Student',
  'Faculty',
  'Project/Patent/MoU',
  'Paper Reviews',
];

const FacTab = {
  'Awards/Recognition/Fellowship': 'awards',
  'PhD/M.Tech./M.S./M.Sc. Guided': 'guided',
  'New Course Developed': 'course',
  'Paper Presentation': 'paper',
  'Outreach': 'outreach'
}

const ReportGeneration = () => {
  const [selectedTab, setSelectedTab] = useState(tabOptions[0]);
  const [studentTab, setStudentTab] = useState('');
  const [projpatmouTab, setProjpatmouTab] = useState('');
  const [facultyTab, setFacultyTab] = useState('');
  const [filterType, setFilterType] = useState('year');
  const [yearOptions, setYearOptions] = useState([]);
  const [academicYear, setAcademicYear] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fileType, setFileType] = useState('');

  useEffect(() => {
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
  }, []);

  const handleDownload = async () => {
    if (!fileType) return alert("Please select a file type");
    if (filterType === 'year' && !academicYear) return alert("Please select academic year");
    if (filterType === 'date' && (!fromDate || !toDate)) return alert("Please select both dates");

    const baseUrl = `http://localhost:5000/api/${selectedTab === 'Project/Patent/MoU' ? 'project-patent-mou' : (selectedTab.toLowerCase().replace(' ', '-')) }/${fileType}`;
    const params = new URLSearchParams()
    params.append('tab', selectedTab);

    params.append('filterType', filterType);
    if (filterType === 'year') {
      params.append('academicYear', academicYear);
    } else {
      params.append('dateFrom', fromDate);
      params.append('dateTo', toDate);
    }

    window.open(`${baseUrl}?${params.toString()}`, '_blank');
  };

  return (
    <div className="report-gen">
      {/* <h2>Generate Reports</h2> */}

      <label>
        Select Tab
        <select value={selectedTab} onChange={e => setSelectedTab(e.target.value)}>
          {tabOptions.map(tab => (
            <option key={tab} value={tab}>{tab}</option>
          ))}
        </select>
      </label>

      <div className="filter-options">
        <label htmlFor="">Filter by:</label>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <label style={{ fontWeight:'normal'}}>
            <input
              type="radio"
              value="year"
              checked={filterType === 'year'}
              onChange={() => setFilterType('year')}
            />
            Academic Year
          </label>
          <label style={{ fontWeight:'normal'}}>
            <input
              type="radio"
              value="date"
              checked={filterType === 'date'}
              onChange={() => setFilterType('date')}
            />
            Date Range
          </label>
        </div>
      </div>

      {filterType === 'year' && (
        <>
          <label>Academic Year
            <select
              name="guided_year"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            >
              <option value="">Select Year</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
      {filterType === 'date' && (
        <div className="date-range">
          <label style={{ marginBottom: 0 }}>
            From
          </label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          <label style={{ marginBottom: 0 }}>
            To
          </label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
        </div>
      )}

      <fieldset className="file-type-options">
        <legend>Select File Type</legend>
        <label>
          <input
            type="radio"
            name="fileType"
            value="xlsx"
            checked={fileType === 'xlsx'}
            onChange={() => setFileType('xlsx')}
          />
          Excel (.xlsx)
        </label>
        <label>
          <input
            type="radio"
            name="fileType"
            value="pdf"
            checked={fileType === 'pdf'}
            onChange={() => setFileType('pdf')}
            disabled
          />
          PDF (.pdf)
        </label>
        <label>
          <input
            type="radio"
            name="fileType"
            value="docx"
            checked={fileType === 'docx'}
            onChange={() => setFileType('docx')}
            disabled
          />
          Word (.docx)
        </label>
      </fieldset>

      <button className="download-button" onClick={handleDownload}>Download Report</button>
    </div>
  );
};

export default ReportGeneration;
