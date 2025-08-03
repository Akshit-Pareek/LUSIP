const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming you have a db.js file exporting your MySQL connection
const multer = require('multer');
const upload = multer();
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const { jsPDF } = require('jspdf');
const { autoTable } = require('jspdf-autotable');
const { saveAs } = require('file-saver');
const ExcelJS = require('exceljs');
const path = require('path');
const bcrypt = require('bcrypt');
const { sendCredentialsMail } = require('../routes/Mail_Faculty'); // Assuming you have a utility function

// POST /api/faculty-info
router.post('/', upload.none(), async (req, res) => {
  const {
    salutation,
    firstName,
    middleName,
    lastName,
    employeeId,
    joiningDate,
    designation,
    department,
    officeContact,
    personalContact,
    email,
    areasOfResearch,
    researchProfile,
    orcid,
    researcherId,
    scopusId,
    googleScholarId,
    vidwanId,
    membership
  } = req.body;
  const membershipData = JSON.parse(membership);

  const connection = await db.getConnection();

  try {
    // Insert into faculty table for login
    const rawPassword = email.substring(0, 8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    await db.query(
      `INSERT INTO faculty (
      employee_id, fname, mname, lname, email, password
    ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        employeeId,
        firstName,
        middleName,
        lastName,
        email,
        hashedPassword
      ]
    );
    // Insert into faculty_info
    const [facultyResult] = await db.query(
      `INSERT INTO faculty_info (
        salutation,first_name, middle_name, last_name, employee_id, joining_date,
        designation, department, office_contact, personal_contact,email,
        areas_of_research, research_profile, orcid, researcher_id,
        scopus_id, google_scholar_id, vidwan_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        salutation, firstName, middleName, lastName, employeeId, joiningDate,
        designation, department, officeContact, personalContact, email,
        areasOfResearch, researchProfile, orcid, researcherId,
        scopusId, googleScholarId, vidwanId
      ]
    );

    const facultyId = facultyResult.insertId;

    await sendCredentialsMail(
      email,
      `${salutation} ${firstName} ${middleName} ${lastName}`,
      rawPassword
    );


    // Insert professional memberships
    for (const m of membershipData) {
      await db.query(
        `INSERT INTO professional_memberships (
          employee_id, name_of_body, abbreviation, type,
          member_since, membership_id
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          employeeId,
          m.name || '',
          m.abbreviation || '',
          m.type || '',
          m.memberSince || null,
          m.membershipId || ''
        ]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Faculty info saved successfully.' });

  } catch (error) {
    await connection.rollback();
    console.error('Error saving faculty info:', error);
    res.status(500).json(error);
  } finally {
    connection.release();
  }
});

router.get('/member/:id', async (req, res) => {
  const employeeId = req.params.id;

  try {
    const [membership] = await db.query(
      `SELECT * FROM professional_memberships WHERE employee_id = ?`,
      [employeeId]
    );
    if (!membership.length) {
      return res.status(404).json({ success: false, error: 'Membership not found' });
    }
    res.json({ success: true, data: { membership } });
  } catch (err) {
    console.error('Error fetching faculty info for edit:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});


// GET: Get faculty info and memberships by employee ID
router.get('/edit/:id', async (req, res) => {
  const employeeId = req.params.id;

  try {
    const [[info]] = await db.query(
      'SELECT * FROM faculty_info WHERE employee_id = ?',
      [employeeId]
    );

    const [memberships] = await db.query(
      `SELECT * FROM professional_memberships WHERE faculty_id = (
        SELECT id FROM faculty WHERE employee_id = ?
      )`,
      [employeeId]
    );

    if (!info) return res.status(404).json({ success: false, error: 'Faculty not found' });

    res.json({ success: true, data: { info, memberships } });
  } catch (err) {
    console.error('Error fetching faculty info for edit:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT: Update faculty info by employee ID
router.put('/:id', upload.none(), async (req, res) => {
  const employeeId = req.params.id;

  const {
    salutation,
    firstName,
    middleName,
    lastName,
    joiningDate,
    designation,
    department,
    officeContact,
    personalContact,
    email,
    areasOfResearch,
    researchProfile,
    orcid,
    researcherId,
    scopusId,
    googleScholarId,
    vidwanId,
    membership
  } = req.body;
  console.log('Updating faculty info for employee ID:', req.body);

  const membershipData = JSON.parse(membership);
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    // Update faculty table (for login info)
    await db.query(
      `UPDATE faculty SET
      fname = ?, mname = ?, lname = ?, email = ?
      WHERE employee_id = ?`,
      [
        firstName,
        middleName,
        lastName,
        email,
        employeeId
      ]
    );
    // Update faculty_info
    await db.query(`
      UPDATE faculty_info SET
        salutation = ?, first_name = ?, middle_name = ?, last_name = ?,
        joining_date = ?, designation = ?, department = ?, office_contact = ?, personal_contact = ?, email = ?,
        areas_of_research = ?, research_profile = ?, orcid = ?, researcher_id = ?, scopus_id = ?,
        google_scholar_id = ?, vidwan_id = ?
      WHERE employee_id = ?`,
      [
        salutation, firstName, middleName, lastName,
        joiningDate, designation, department, officeContact, personalContact, email,
        areasOfResearch, researchProfile, orcid, researcherId, scopusId,
        googleScholarId, vidwanId, employeeId
      ]
    );

    // Delete old memberships
    await db.query(
      'DELETE FROM professional_memberships WHERE employee_id = ?',
      [employeeId]
    );

    // Insert updated memberships
    for (const m of membershipData) {
      await db.query(`
        INSERT INTO professional_memberships (
          employee_id, name_of_body, abbreviation, type,
          member_since, membership_id
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          employeeId,
          m.name || '',
          m.abbreviation || '',
          m.type || '',
          m.memberSince || null,
          m.membershipId || ''
        ]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Faculty info updated successfully.' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating faculty info:', error);
    res.status(500).json({ success: false, error: 'Failed to update faculty information.' });
  } finally {
    connection.release();
  }
});


async function getfacultyInfoByYear(academicYear) {
  // Parse start and end dates from academicYear
  const year = academicYear.split('-') || '';
  const startYear = year[0];
  const endYear = year[1];
  const startDate = `${startYear}-08-01`;
  const endDate = `20${endYear}-07-31`;
  console.log('startDate:', startDate)
  console.log('endDate:', endDate)

  const [faculties] = await db.query(
    `SELECT * FROM faculty_info WHERE joining_date >= ? AND joining_date <= ?`,
    [startDate, endDate]
  );
  for (const f of faculties) {
    const [memberships] = await db.query(
      `SELECT * FROM professional_memberships WHERE employee_id = ?`,
      [f.employee_id]
    );
    f.memberships = memberships;
  }
  console.log(faculties.memberships);
  return faculties;
}
async function getfacultyInfoByDate(dateFrom, dateTo) {
  const [faculties] = await db.query(`SELECT * FROM faculty_info WHERE joining_date >= ? AND joining_date <= ?`,
    [dateFrom, dateTo]);
  for (const f of faculties) {
    const [memberships] = await db.query(
      `SELECT * FROM professional_memberships WHERE employee_id = ?`,
      [f.employee_id]
    );
    f.memberships = memberships;
  }
  console.log(faculties.memberships);
  return faculties;
}


router.get('/pdf', async (req, res) => {
  const params = {
    filterType: req.query.filterType,
    academicYear: req.query.academicYear || '',
    dateFrom: req.query.dateFrom || '',
    dateTo: req.query.dateTo || ''
  };
  console.log('params', params);
  const facultyList = await (params.filterType === 'year'
    ? getfacultyInfoByYear(params.academicYear)
    : getfacultyInfoByDate(params.dateFrom, params.dateTo));

  if (!facultyList || facultyList.length === 0) {
    return res.status(404).send('<script>alert("No faculty data found!"); window.history.back();</script>');
  }

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Faculty Information Report', 14, 16);
  let y = 26;

  doc.setFontSize(12);

  facultyList.forEach((faculty, index) => {
    doc.text(`Sr.No: ${index + 1}`, 14, y);
    y += 6;
    doc.text(`Name: ${faculty.salutation} ${faculty.first_name} ${faculty.middle_name || ''} ${faculty.last_name}`, 14, y);
    y += 6;
    doc.text(`Employee ID: ${faculty.employee_id}`, 14, y);
    y += 6;
    doc.text(`Joining Date: ${faculty.joining_date}`, 14, y);
    y += 6;
    doc.text(`Designation: ${faculty.designation}`, 14, y);
    y += 6;
    doc.text(`Department: ${faculty.department}`, 14, y);
    y += 6;
    doc.text(`Office Contact: ${faculty.office_contact}`, 14, y);
    y += 6;
    doc.text(`Personal Contact: ${faculty.personal_contact}`, 14, y);
    y += 6;
    doc.text(`Areas of Research: ${faculty.areas_of_research}`, 14, y);
    y += 6;
    doc.text(`Research Profile: ${faculty.research_profile}`, 14, y);
    y += 6;
    doc.text(`ORCID: ${faculty.orcid || ''}, ResearcherID: ${faculty.researcher_id || ''}`, 14, y);
    y += 6;
    doc.text(`Scopus ID: ${faculty.scopus_id || ''}, Google Scholar ID: ${faculty.google_scholar_id || ''}, Vidwan ID: ${faculty.vidwan_id || ''}`, 14, y);
    y += 10;

    if (faculty.memberships.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Sr.No.', 'Name of Body', 'Abbr.', 'Type', 'Member Since', 'Membership ID']],
        body: faculty.memberships.map((m, index) => [
          index + 1,
          m.name_of_body,
          m.abbreviation,
          m.type,
          m.member_since,
          m.membership_id,
        ]),
        theme: 'grid',
        styles: { fontSize: 10 },
      });
      y = doc.lastAutoTable.finalY + 10;
    }
  });

  const pdfBuffer = doc.output('arraybuffer');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="Faculty_Info_Report.pdf"');
  res.send(Buffer.from(pdfBuffer));
});

router.get('/docx', async (req, res) => {
  const params = {
    filterType: req.query.filterType,
    academicYear: req.query.academicYear || '',
    dateFrom: req.query.dateFrom || '',
    dateTo: req.query.dateTo || ''
  };
  console.log('params', params);
  const facultyList = await (params.filterType === 'year'
    ? getfacultyInfoByYear(params.academicYear)
    : getfacultyInfoByDate(params.dateFrom, params.dateTo));

  if (!facultyList || facultyList.length === 0) {
    return res.status(404).send('<script>alert("No faculty data found!"); window.history.back();</script>');
  }

  const sections = [];

  facultyList.forEach((f, index) => {
    sections.push(
      new Paragraph(`Sr.NO.: ${index + 1}`),
      new Paragraph({ text: `Name: ${f.salutation} ${f.first_name} ${f.middle_name || ''} ${f.last_name}`, heading: "Heading2" }),
      new Paragraph(`Employee ID: ${f.employee_id}`),
      new Paragraph(`Joining Date: ${f.joining_date}`),
      new Paragraph(`Designation: ${f.designation}`),
      new Paragraph(`Department: ${f.department}`),
      new Paragraph(`Office Contact: ${f.office_contact}`),
      new Paragraph(`Personal Contact: ${f.personal_contact}`),
      new Paragraph(`Areas of Research: ${f.areas_of_research}`),
      new Paragraph(`Research Profile: ${f.research_profile}`),
      new Paragraph(`IDs: ORCID - ${f.orcid}, ResearcherID - ${f.researcher_id}, ScopusID - ${f.scopus_id}, GoogleScholarID - ${f.google_scholar_id}, VidwanID - ${f.vidwan_id}`),
    );

    if (f.memberships?.length) {
      sections.push(new Paragraph({ text: "Memberships:", heading: "Heading3" }));
      f.memberships.forEach((m, mIndex) => {
        sections.push(
          new Paragraph(`-${mIndex + 1}. ${m.name_of_body} (${m.abbreviation}), Type: ${m.type}, Since: ${m.member_since}, ID: ${m.membership_id}`)
        );
      });
    }

    sections.push(new Paragraph("")); // Line break
  });

  const doc = new Document({
    creator: "LUSIP Backend",
    title: "Faculty Info Report",
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const filePath = path.join(__dirname, "../Faculty_Info_Report.docx");
  fs.writeFileSync(filePath, buffer);

  res.download(filePath);
});

router.get('/xlsx', async (req, res) => {
  // Parse query parameters for filterType, academicYear, dateFrom, dateTo
  const params = {
    filterType: req.query.filterType,
    academicYear: req.query.academicYear || '',
    dateFrom: req.query.dateFrom || '',
    dateTo: req.query.dateTo || ''
  };
  console.log('params', params);
  const facultyList = await (params.filterType === 'year'
    ? getfacultyInfoByYear(params.academicYear)
    : getfacultyInfoByDate(params.dateFrom, params.dateTo));

  if (!facultyList || facultyList.length === 0) {
    return res.status(404).send('<script>alert("No faculty data found!"); window.history.back();</script>');
  }

  const workbook = new ExcelJS.Workbook();
  const heading = `List of Faculties (Sorted by ${params.filterType === 'year' ? `Year ${params.academicYear}` : `Date ${params.dateFrom} - ${params.dateTo}`})`;
  const memHeading = `List of Memberships`;

  const sheet = workbook.addWorksheet('Faculty Info');
  const memSheet = workbook.addWorksheet('Memberships')

  const headingRow = sheet.addRow([heading]);
  const memRow = memSheet.addRow([memHeading]);

  headingRow.font = { bold: true, size: 20 };
  headingRow.alignment = { horizontal: 'center' }
  sheet.mergeCells(`A1:N1`);
  sheet.addRow([]);

  memRow.font = { bold: true, size: 20 };
  memRow.alignment = { horizontal: 'center' }
  memSheet.mergeCells(`A1:F1`);
  memSheet.addRow([]);
  // Define header row
  const headerRow = [
    'Sr. No.',
    'Name', 'Employee ID', 'Joining Date', 'Designation', 'Department',
    'Office Contact', 'Personal Contact', 'Areas of Research',
    'ORCID', 'ResearcherID', 'ScopusID',
    'GoogleScholarID', 'VidwanID'
  ];
  let headerLength = [];

  sheet.addRow(headerRow);
  for (let i = 0; i < headerRow.length; i++) {
    headerLength = headerRow[i].length;

  }

  // Add bold to header and borders
  const header = sheet.getRow(3);
  header.font = { bold: true };
  header.eachCell(cell => {
    cell.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' }
    };
  });

  // Fill rows
  facultyList.forEach((f, index) => {
    const row = [
      index + 1,
      `${f.salutation} ${f.first_name} ${f.middle_name || ''} ${f.last_name}`.trim(),
      f.employee_id,
      String(f.joining_date).slice(0, 15),
      f.designation,
      f.department,
      f.office_contact,
      f.personal_contact,
      f.areas_of_research,
      f.orcid,
      f.researcher_id,
      f.scopus_id,
      f.google_scholar_id,
      f.vidwan_id
    ];
    const addedRow = sheet.addRow(row);

    addedRow.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    if (f.memberships.length > 0) {
      const membershipHeader = ['Sr.No.', 'Name of Body', 'Abbr.', 'Type', 'Member Since', 'Membership ID'];
      const membershipHeaderRow = memSheet.addRow(membershipHeader);
      membershipHeaderRow.font = { bold: true };
      membershipHeaderRow.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
      });

      f.memberships.forEach((m, index) => {
        const memRow = [
          index + 1,
          m.name_of_body, m.abbreviation, m.type, String(m.member_since).slice(0, 15), m.membership_id
        ];
        const rowObj = memSheet.addRow(memRow);
        rowObj.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' }, bottom: { style: 'thin' },
            left: { style: 'thin' }, right: { style: 'thin' }
          };
        });
      });
      sheet.addRow([]);
    }
  });

  // Auto-fit column widths more accurately
  sheet.columns.forEach(col => {
    let maxLength = 0;
    col.eachCell({ includeEmpty: true }, cell => {
      if (cell.row <= 2) return;

      let val = cell.value;
      if (val == null) val = '';
      else if (typeof val !== 'string') val = val.toString();
      // Remove extra spaces for accurate width
      val = val.trim();
      // For multi-line cells, take the longest line
      const lines = val.split('\n');
      const longest = lines.reduce((max, line) => Math.max(max, line.length), 0);
      maxLength = Math.max(maxLength, longest);
    });
    // Set width with a small buffer, but not too large
    col.width = maxLength > 0 ? maxLength + 1 : 10;
  });
  memSheet.columns.forEach(col => {
    let maxLength = 0;
    col.eachCell({ includeEmpty: true }, cell => {
      if (cell.row <= 2) return;

      let val = cell.value;
      if (val == null) val = '';
      else if (typeof val !== 'string') val = val.toString();
      // Remove extra spaces for accurate width
      val = val.trim();
      // For multi-line cells, take the longest line
      const lines = val.split('\n');
      const longest = lines.reduce((max, line) => Math.max(max, line.length), 0);
      maxLength = Math.max(maxLength, longest);
    });
    // Set width with a small buffer, but not too large
    col.width = maxLength > 0 ? maxLength + 2 : 10;
  });

  const filePath = path.join(__dirname, '../Faculty_Info_Report.xlsx');
  await workbook.xlsx.writeFile(filePath);

  res.download(filePath, 'Faculty_Info_Report.xlsx')
});

module.exports = router;
