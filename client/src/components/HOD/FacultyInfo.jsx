import React, { useState, useEffect } from 'react';
import './FacultyInfo.css';
import { useNavigate } from 'react-router-dom';
import { useLocation, useParams } from 'react-router-dom';


// import { saveAs } from 'file-saver';
// import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import 'jspdf-autotable';
// import { Document, Packer, Paragraph, Table, TableCell, TableRow } from 'docx';

const FacultyInfo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    salutation: 'Prof',
    firstName: '',
    middleName: '',
    lastName: '',
    employeeId: '',
    joiningDate: '',
    designation: '',
    department: 'CSE',
    officeContact: '',
    personalContact: '',
    email: '',
    areasOfResearch: '',
    researchProfile: '',
    orcid: '',
    researcherId: '',
    scopusId: '',
    googleScholarId: '',
    vidwanId: '',
    membership: [{
      name: '',
      abbreviation: '',
      type: '',
      memberSince: '',
      membershipId: ''
    }]
  });

  const location = useLocation();
  const editData = location.state ? location.state.data : null;
  const isEditing = !!editData;
  // console.log('Edit Data:', editData);
  useEffect(() => {
  if (editData) {
    // Step 1: Set form data (excluding membership)
    setFormData(prev => ({
      ...prev,
      salutation: editData.salutation || 'Prof',
      firstName: editData.first_name || '',
      middleName: editData.middle_name || '',
      lastName: editData.last_name || '',
      employeeId: editData.employee_id || '',
      joiningDate: editData.joining_date.slice(0,10) || '',
      designation: editData.designation || '',
      department: editData.department || 'CSE',
      officeContact: editData.office_contact || '',
      personalContact: editData.personal_contact || '',
      email: editData.email || '',
      areasOfResearch: editData.areas_of_research || '',
      orcid: editData.orcid || '',
      researcherId: editData.researcher_id || '',
      scopusId: editData.scopus_id || '',
      googleScholarId: editData.google_scholar_id || '',
      vidwanId: editData.vidwan_id || '',
      membership: [], // temporary empty; will populate below
    }));

    // Step 2: Fetch membership from backend using employee_id
    const fetchMembership = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/faculty-info/member/${editData.employee_id}`);
        const data = await res.json();
        // console.log('Membership Data:', data.data.membership);
        if (data.success && Array.isArray(data.data.membership)) {
          const converted = data.data.membership.map(m => ({
              name: m.name_of_body,
              abbreviation: m.abbreviation,
              type: m.type,
              memberSince: m.member_since.slice(0,10),
              membershipId: m.membership_id,
          }));
          setFormData(prev => ({
            ...prev,
            membership: converted,
          }));
        } else {
          console.warn("No membership data found.");
        }
      } catch (error) {
        console.error("Failed to fetch membership data:", error);
      }
    };

    fetchMembership();
  }
}, [editData]);




  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMembershipChange = (e, index) => {
    const { name, value } = e.target;
    const updatedMembership = [...formData.membership];
    updatedMembership[index][name] = value;
    setFormData(prev => ({ ...prev, membership: updatedMembership }));
  };

  const addMembership = () => {
    setFormData(prev => ({
      ...prev,
      membership: [...prev.membership, {
        name: '',
        abbreviation: '',
        type: '',
        memberSince: '',
        membershipId: ''
      }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    
    try {
      let response,Data;
      if (isEditing) {
        Data = new FormData();
        // console.log('FORMDATA',formData);
        Data.append('salutation', formData.salutation);
        Data.append('firstName', formData.firstName);
        Data.append('middleName', formData.middleName);
        Data.append('lastName', formData.lastName);
        Data.append('employeeId', formData.employeeId);
        Data.append('joiningDate', formData.joiningDate);
        Data.append('designation', formData.designation);
        Data.append('department', formData.department);
        Data.append('officeContact', formData.officeContact);
        Data.append('personalContact', formData.personalContact);
        Data.append('email', formData.email);
        Data.append('areasOfResearch', formData.areasOfResearch);
        Data.append('researchProfile', formData.researchProfile);
        Data.append('orcid', formData.orcid);
        Data.append('researcherId', formData.researcherId);
        Data.append('scopusId', formData.scopusId);
        Data.append('googleScholarId', formData.googleScholarId);
        Data.append('vidwanId', formData.vidwanId);
        
        // Important: stringify the membership array
        Data.append('membership', JSON.stringify(formData.membership));
        // for (let [key, value] of Data.entries()) {
          //   console.log(`${key}: ${value}`);
          // }
          
          // console.log('Editing:', Data);
          response = await fetch(`http://localhost:5000/api/faculty-info/${formData.employeeId}`, {
            method: 'PUT',
            body: Data
          });
          navigate('/hod/faculty-info');
        }
        else{
          Data = new FormData();
          Data.append('salutation', formData.salutation);
          Data.append('firstName', formData.firstName);
          Data.append('middleName', formData.middleName);
          Data.append('lastName', formData.lastName);
          Data.append('employeeId', formData.employeeId);
          Data.append('joiningDate', formData.joiningDate);
          Data.append('designation', formData.designation);
          Data.append('department', formData.department);
          Data.append('officeContact', formData.officeContact);
          Data.append('personalContact', formData.personalContact);
          Data.append('email', formData.email);
          Data.append('areasOfResearch', formData.areasOfResearch);
          Data.append('researchProfile', formData.researchProfile);
          Data.append('orcid', formData.orcid);
          Data.append('researcherId', formData.researcherId);
          Data.append('scopusId', formData.scopusId);
          Data.append('googleScholarId', formData.googleScholarId);
          Data.append('vidwanId', formData.vidwanId);
          // Important: stringify the membership array
          Data.append('membership', JSON.stringify(formData.membership));
          
          response = await fetch('http://localhost:5000/api/faculty-info', {
            method: 'POST',
            body: Data
          });
      }
      
      const result = await response.json();

      console.log('Result:', response);
      if (response.ok) {
        alert('Faculty info submitted successfully!');

        // Optional: Reset the form
        setFormData({
          salutation: 'Prof',
          firstName: '',
          middleName: '',
          lastName: '',
          employeeId: '',
          joiningDate: '',
          designation: '',
          department: 'CSE',
          officeContact: '',
          personalContact: '',
          email: '',
          areasOfResearch: '',
          researchProfile: '',
          orcid: '',
          researcherId: '',
          scopusId: '',
          googleScholarId: '',
          vidwanId: '',
          membership: [{
            name: '',
            abbreviation: '',
            type: '',
            memberSince: '',
            membershipId: ''
          }]
        });

      } else {
        // console.error('Server error:', result.message || result);
        alert(result.message);
      }

    } catch (err) {
      console.error('Error submitting faculty info:', err);
      alert('Something went wrong!');
    }
  };


  
  return (
    <>
      <form className="faculty-form" onSubmit={handleSubmit}>
        {/* <h2 style={{ fontWeight: '700', textAlign: 'center', fontSize: 'xx-large' }}>Faculty Information</h2> */}

        <div className="parent">
          <h2>Employee Detail</h2>
          <div className="form-subgroup">
            <div className="form-row">
              <label className='required'>Name</label>
              <div>
                <select style={{ width: '100%' }} onChange={handleChange} value={formData.salutation} name="salutation" id="" >
                  <option>Prof</option>
                  <option>Dr</option>
                  <option>Mr</option>
                  <option>Ms</option>
                </select>
              </div >
              <input pattern='^[a-zA-Z]+$' title="Name must contain only letters" placeholder='First Name' name="firstName" value={formData.firstName} onChange={handleChange} />
              <input pattern='^[a-zA-Z]+$' title="Name must contain only letters" placeholder='Middle Name' name="middleName" value={formData.middleName} onChange={handleChange} />
              <input pattern='^[a-zA-Z]+$' title="Name must contain only letters" placeholder='Last Name' name="lastName" value={formData.lastName} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <label className='required'>Employee ID</label>
            <input name="employeeId" value={formData.employeeId} onChange={handleChange} />
            <label className='required'>Joining Date</label>
            <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} />
          </div>

          <div className="form-row">
            <label className='required'>Designation</label>
            <select name="designation" value={formData.designation} onChange={handleChange}>
              <option value="">Select</option>
              <option>Assistant Professor</option>
              <option>Associate Professor</option>
              <option>Professor</option>
            </select>
            <label className='required'>Department</label>
            <select name="department" value={formData.department} onChange={handleChange}>
              <option>CSE</option>
              <option>CCE</option>
              <option>ECE</option>
              <option>MME</option>
              <option>Mathematics</option>
              <option>Physics</option>
              <option>HSS</option>
            </select>
          </div>

          <div className="form-row">
            <label>Office Contact</label>
            <input pattern="^[0-9]{10}$" title="Phone number must be 10 digits" name="officeContact" value={formData.officeContact} onChange={handleChange} />
            <label>Personal Contact</label>
            <input pattern="^[0-9]{10}$" title="Phone number must be 10 digits" name="personalContact" value={formData.personalContact} onChange={handleChange} />
            <label className='required'>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
        </div>
        <div className="parent">
          <h2>Research Profile</h2>
          <div className="form-row">
            <label>Area of Research</label>
            <input name="areasOfResearch" value={formData.areasOfResearch} onChange={handleChange} />
            <label className='required'>ORCID</label>
            <input name="orcid" value={formData.orcid} onChange={handleChange} />
          </div>

          <div className="form-row">
            <label className='required'>Vidwan ID</label>
            <input name="vidwanId" value={formData.vidwanId} onChange={handleChange} />
            <label className='required'>ResearcherID</label>
            <input name="researcherId" value={formData.researcherId} onChange={handleChange} />
          </div>

          <div className="form-row">
            <label className='required'>Scopus ID</label>
            <input name="scopusId" value={formData.scopusId} onChange={handleChange} />
            <label className='required'>Google Scholar ID</label>
            <input name="googleScholarId" value={formData.googleScholarId} onChange={handleChange} />
          </div>
        </div>

        <div className="parent">
          <h2>Professional Membership(s)</h2>
          {formData.membership.map((m, index) => (
            <div key={index} className="form-subgroup">
              <h2><u>Professional Body {index + 1}</u></h2>
              <div className="form-row">
                <label className='required'>Name of Body</label>
                <input name="name" value={m.name} onChange={(e) => handleMembershipChange(e, index)} required />
                <label>Abbreviation</label>
                <input name="abbreviation" value={m.abbreviation} onChange={(e) => handleMembershipChange(e, index)} />
              </div>
              <div className="form-row">
                <label className='required'>Membership Type</label>
                <input name="type" value={m.type} onChange={(e) => handleMembershipChange(e, index)} required />
                <label className='required'>Member Since</label>
                <input type="date" name="memberSince" max={new Date().toISOString().split('T')[0]} value={m.memberSince} onChange={(e) => handleMembershipChange(e, index)} required />
                <label className='required'>Membership ID</label>
                <input name="membershipId" value={m.membershipId} onChange={(e) => handleMembershipChange(e, index)} required />
              </div>
            </div>
          ))}
          <button type="button" onClick={addMembership} className="add-btn">+ Add Membership</button>

        </div>
        <button style={{ background: '#28a745' }} type="submit" className="submit-btn">Submit</button>

      </form>
      <div className="faculty-form" style={{ marginTop: 25, display: 'flex', gap: '5px', justifyContent: 'center' }}>
        <div style={{ fontWeight: 'bold', fontSize: 'large', width: '100%', alignSelf: 'center' }}>Download Report:</div>
        <button style={{ color: 'white', border: 'none', width: '100%', backgroundColor: '#3c8dbc', padding: '20px' }} onClick={() => window.open('http://localhost:5000/api/faculty-info/pdf', '_blank')}>Download PDF</button>
        <button style={{ color: 'white', border: 'none', width: '100%', backgroundColor: '#3c8dbc', padding: '20px' }} onClick={() => window.open('http://localhost:5000/api/faculty-info/csv', '_blank')}>Download CSV</button>
        <button style={{ color: 'white', border: 'none', width: '100%', backgroundColor: '#3c8dbc', padding: '20px' }} onClick={() => window.open('http://localhost:5000/api/faculty-info/docx', '_blank')}>Download DOCX</button>
      </div>
    </>
  );
};

export default FacultyInfo;


// import React, { useEffect, useState } from 'react';
// import './FacultyInfo.css';

// const FacultyInfo = () => {
  //   const [faculties, setFaculties] = useState([]);
//   const [showAddWindow, setShowAddWindow] = useState(false);
//   const [showDeleteWindow, setShowDeleteWindow] = useState(false);
//   const [formData, setFormData] = useState({
//     faculty_id: '',
//     fname: '',
//     mname: '',
//     lname: '',
//     department: '',
//     email: ''
//   });
//   const [deleteId, setDeleteId] = useState('');

//   const fetchFaculties = async () => {
  //     const res = await fetch('http://localhost:5000/api/faculty');
  //     const data = await res.json();
  //     setFaculties(data);
  //   };
  
  //   useEffect(() => {
    //     fetchFaculties();
    //   }, []);
    
    //   const handleAddFaculty = async (e) => {
      //     e.preventDefault();
      //     const res = await fetch('http://localhost:5000/api/faculty', {
        //       method: 'POST',
        //       headers: { 'Content-Type': 'application/json' },
        //       body: JSON.stringify(formData)
        //     });
        //     if (res.ok) {
          //       alert('Faculty added!');
          //       setFormData({ faculty_id: '', fname: '',mname: '',lname: '', department: '', email: ''});
          //       setShowAddWindow(false);
          //       fetchFaculties();
          //     } else {
            //       alert('Error adding faculty.');
            //     }
            //   };
            
            //   const handleDeleteFaculty = async (id) => {
              //     const confirmed = window.confirm(`Are you sure you want to delete Faculty ID ${id}?`);
              //     if (!confirmed) return;
              
              //     const res = await fetch(`http://localhost:5000/api/faculty/${id}`, {
                //       method: 'DELETE'
                //     });
//     if (res.ok) {
  //       alert('Faculty deleted!');
//       setDeleteId('');
//       setShowDeleteWindow(false);
//       fetchFaculties();
//     } else {
//       alert('Error deleting faculty.');
//     }
//   };



//   return (
  //     <div className="faculty-container">
  //       <h3>Faculty Member List</h3>
  //       <div className="faculty-buttons">
  //         <button onClick={() => setShowAddWindow(true)}>Add Faculty Member</button>
  //         <button onClick={() => setShowDeleteWindow(true)}>Delete Faculty by EmpID</button>
  //       </div>
  
  //       <table className="faculty-table">
  //         <thead>
  //           <tr>
  //             <th>Sr. No.</th>
  //             <th>EmpID</th>
  //             <th>First Name</th>
  //             <th>Middle Name</th>
  //             <th>Last Name</th>
  //             <th>Dept.</th>
  //             <th>Email ID</th>
  //             <th></th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {faculties.map((f) => (
//             <tr key={f.faculty_id}>
//               <td>{faculties.indexOf(f) + 1}</td>
//               <td>{f.faculty_id}</td>
//               <td>{f.fname}</td>
//               <td>{f.mname}</td>
//               <td>{f.lname}</td>
//               <td>{f.department}</td>
//               <td>{f.email}</td>
//               <td><button className='dustbutton' onClick={(e)=>{handleDeleteFaculty(f.faculty_id)}}><img src="/delete.png" alt="" /></button></td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Add Faculty Window */}
//       {showAddWindow && (
//         <div className="popup-overlay">
//           <div className="popup-card">
//             <h3>Add Faculty Member</h3>
//             <form onSubmit={handleAddFaculty}>
//               <input placeholder="Employee ID" value={formData.faculty_id} onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })} required />
//               <input placeholder="First Name" value={formData.fname} onChange={(e) => setFormData({ ...formData, fname: e.target.value })} required />
//               <input placeholder="Middle Name" value={formData.mname} onChange={(e) => setFormData({ ...formData, mname: e.target.value })}  />
//               <input placeholder="Last Name" value={formData.lname} onChange={(e) => setFormData({ ...formData, lname: e.target.value })} required />
//               <input placeholder="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required />
//               <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
//               <button type="submit">Add</button>
//               <button type="button" onClick={() => setShowAddWindow(false)}>Cancel</button>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Delete Faculty Window */}
//       {showDeleteWindow && (
//         <div className="popup-overlay">
//           <div className="popup-card">
//             <h3>Delete Faculty</h3>
//             <input placeholder="Faculty ID" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} required />
//             <button onClick={()=>handleDeleteFaculty(deleteId)}>Delete</button>
//             <button onClick={() => setShowDeleteWindow(false)}>Cancel</button>
//           </div>
//         </div>
//       )}
//       <div style={{ marginTop: 16,display: 'flex',gap:'5px', justifyContent: 'center' }}>
//         <button style={{color:'white',border:'none',width:'100%',backgroundColor:'#3c8dbc',padding:'20px'}} onClick={exportCSV}>Export CSV</button>
//         <button onClick={exportPDF} style={{color:'white',border:'none',width:'100%',backgroundColor:'#3c8dbc', marginLeft: 8,padding:'20px' }}>Export PDF</button>
//         <button onClick={exportWord} style={{color:'white',border:'none',width:'100%',backgroundColor:'#3c8dbc', marginLeft: 8,padding:'20px' }}>Export Word</button>
//       </div>
//     </div>
//   );
// };

// export default FacultyInfo;

// // --- CSV Export ---
// const exportCSV = () => {
//   const header = ['Employee ID', 'First Name', 'Middle Name', 'Last Name', 'Department', 'Email'];
//   const rows = faculties.map(f => [f.faculty_id, f.fname, f.mname, f.lname, f.department, f.email]);
//   const csvContent =
//     [header, ...rows]
//       .map(r => r.map(cell => `"${cell}"`).join(','))
//       .join('\n');
//   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//   saveAs(blob, 'faculty_info.csv');
// };

// // --- PDF Export ---
// const exportPDF = () => {
//   const doc = new jsPDF();
//   doc.text('Faculty Information', 14, 16);
//   // autoTable takes columns and data
//   autoTable(doc, {
//     startY: 20,
//     head: [['Employee ID', 'First Name', 'Middle Name', 'Last Name', 'Department', 'Email']],
//     body: faculties.map(f => [f.faculty_id, f.fname, f.mname, f.lname, f.department, f.email]),
//   });
//   doc.save('faculty_info.pdf');
// };

// // --- Word Export ---
// const exportWord = async () => {
//   // build docx table rows
//   const tableRows = [
//     new TableRow({
//       children: ['Employee ID', 'First Name', 'Middle Name', 'Last Name', 'Department', 'Email'].map(text =>
//         new TableCell({ children: [new Paragraph({ text })] })
//       )
//     }),
//     ...faculties.map(f =>
//       new TableRow({
//         children: [f.faculty_id, f.fname, f.mname, f.lname, f.department, f.email].map(text =>
//           new TableCell({ children: [new Paragraph({ text })] })
//         )
//       })
//     )
//   ];

//   const doc = new Document({
//     sections: [{
//       properties: {},
//       children: [
//         new Paragraph({ text: 'Faculty Information', heading: 'Heading1' }),
//         new Table({ rows: tableRows })
//       ]
//     }]
//   });

//   const blob = await Packer.toBlob(doc);
//   saveAs(blob, 'faculty_info.docx');
// };