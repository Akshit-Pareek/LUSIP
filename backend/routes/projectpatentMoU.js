const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const db = require('../db');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Document, Packer, Paragraph, HeadingLevel, TextRun } = require('docx');

// === Storage for certificates ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = path.join(__dirname, '../uploads/ProjectPatentMoU');
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// === POST Route ===
router.post('/', upload.single('certificate'), async (req, res) => {
  try {
    const certificatePath = req.file ? req.file.path : null;

    const data = {
      category: req.body.category || null,
      title: req.body.title || null,
      projectId: req.body.projectId || null,
      amount: req.body.amount || null,
      duration: req.body.duration || null,
      certificate: certificatePath,
      report: req.body.report || null,

      awardingAgency: req.body.awardingAgency || null,
      typeOfFunding: req.body.typeOfFunding || null,
      otherFundingDetails: req.body.otherFundingDetails || null,
      research_date: req.body.research_date || null,

      pi_name: req.body.category === 'Research and Development' ? JSON.parse(req.body.principalInvestigator) : null,
      co_pi_name: req.body.category === 'Research and Development' ? JSON.parse(req.body.coPrincipalInvestigator) : null,
      faculty_in_charge: req.body.category === 'Consultancy' ? JSON.parse(req.body.facultyInCharge) : null,
      collaborationAgency: req.body.collaborationAgency || null,
      consultancy_date: req.body.consultancy_date || null,

      patent_type: req.body.type || null,
      patent_agency: req.body.agency || null,
      patent_month: req.body.month || null,
      patent_year: req.body.year || null,
      inventors: req.body.category === 'Patent' ? JSON.parse(req.body.inventors) : null,

      organizationName: req.body.organizationName || null,
      organizationSector: req.body.organizationSector || null,
      departmentAtInstitute: req.body.departmentAtInstitute || null,
      signedOnDate: req.body.signedOnDate && req.body.signedOnDate !== 'null' && req.body.signedOnDate !== '' ? req.body.signedOnDate : null,
      level: req.body.level || null,
      typeOfMoU: req.body.typeOfMoU || null,
      activities: req.body.category === 'MoU' ? JSON.parse(req.body.activities) : null,
    };
    console.log("JSON: ", req.body);

    const sql = `
      INSERT INTO project_patent_mou (
        research_date, consultancy_date,
        category, title, projectId, amount, duration, certificate,
        awardingAgency, typeOfFunding, otherFundingDetails,
        pi_name, co_pi_name, faculty_in_charge, collaborationAgency,
        patent_type, patent_agency, patent_month, patent_year, inventors,
        organizationName, organizationSector, departmentAtInstitute, signedOnDate, level, typeOfMoU, activities
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.research_date, data.consultancy_date,
      data.category, data.title, data.projectId, data.amount, data.duration, data.certificate,
      data.awardingAgency, data.typeOfFunding, data.otherFundingDetails,
      JSON.stringify(data.pi_name), JSON.stringify(data.co_pi_name), JSON.stringify(data.faculty_in_charge), data.collaborationAgency,
      data.patent_type, data.patent_agency, data.patent_month, data.patent_year, JSON.stringify(data.inventors),
      data.organizationName, data.organizationSector, data.departmentAtInstitute, data.signedOnDate, data.level, data.typeOfMoU, JSON.stringify(data.activities)
    ];

    await db.query(sql, values);
    res.status(201).json({ message: 'Data submitted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error saving data' });
  }
});

// === PUT Route ===
router.put('/:id', upload.single('certificate'), async (req, res) => {
  try {
    const id = req.params.id;

    const data = {
      category: req.body.category[0] || null,
      title: req.body.title || null,
      projectId: req.body.projectId || null,
      amount: req.body.amount || null,
      duration: req.body.duration || null,
      report: req.body.report || null,

      awardingAgency: req.body.awardingAgency || null,
      typeOfFunding: req.body.typeOfFunding || null,
      otherFundingDetails: req.body.otherFundingDetails || null,
      research_date: req.body.research_date || null,

      pi_name: req.body.category[0] === 'Research and Development' ? JSON.parse(req.body.principalInvestigator) : null,
      co_pi_name: req.body.category[0] === 'Research and Development' ? JSON.parse(req.body.coPrincipalInvestigator) : null,
      faculty_in_charge: req.body.category[0] === 'Consultancy' ? JSON.parse(req.body.facultyInCharge) : null,
      collaborationAgency: req.body.collaborationAgency || null,
      consultancy_date: req.body.consultancy_date || null,

      patent_type: req.body.type || null,
      patent_agency: req.body.agency || null,
      patent_month: req.body.month || null,
      patent_year: req.body.year || null,
      inventors: req.body.category[0] === 'Patent' ? JSON.parse(req.body.inventors) : null,

      organizationName: req.body.organizationName || null,
      organizationSector: req.body.organizationSector || null,
      departmentAtInstitute: req.body.departmentAtInstitute || null,
      signedOnDate: req.body.signedOnDate && req.body.signedOnDate !== 'null' && req.body.signedOnDate !== '' ? req.body.signedOnDate : null,
      level: req.body.level || null,
      typeOfMoU: req.body.typeOfMoU || null,
      activities: req.body.category[0] === 'MoU' ? JSON.parse(req.body.activities) : null,
    };
    console.log("PI:", req.body);

    const [rows] = await db.query('SELECT certificate FROM project_patent_mou WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project/Patent/MoU record not found.' });
    }

    let certificatePath = rows[0].certificate;

    // If a new certificate is uploaded, replace the old one
    if (req.file) {
      // Delete old certificate file if exists
      if (certificatePath && fs.existsSync(certificatePath)) {
        fs.unlinkSync(certificatePath);
      }
      certificatePath = req.file.path;
    }

    const sql = `UPDATE project_patent_mou SET research_date= ?, consultancy_date= ?, category = ?, title = ?, projectId = ?, amount = ?, duration = ?, certificate = ?, awardingAgency = ?, typeOfFunding = ?, otherFundingDetails = ?, pi_name = ?, co_pi_name = ?, faculty_in_charge = ?, collaborationAgency = ?, patent_type = ?, patent_agency = ?, patent_month = ?, patent_year = ?, inventors = ?, organizationName = ?, organizationSector = ?, departmentAtInstitute = ?, signedOnDate = ?, level = ?, typeOfMoU = ?, activities = ? WHERE id = ?`;

    const values = [
      data.research_date, data.consultancy_date,
      data.category, data.title, data.projectId, data.amount, data.duration, certificatePath,
      data.awardingAgency, data.typeOfFunding, data.otherFundingDetails,
      JSON.stringify(data.pi_name), JSON.stringify(data.co_pi_name), JSON.stringify(data.faculty_in_charge), data.collaborationAgency,
      data.patent_type, data.patent_agency, data.patent_month, data.patent_year, JSON.stringify(data.inventors),
      data.organizationName, data.organizationSector, data.departmentAtInstitute, data.signedOnDate, data.level, data.typeOfMoU, JSON.stringify(data.activities),
      id
    ];

    await db.query(sql, values);
    res.status(200).json({ message: 'Data updated successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating data' });
  }
});

async function getProjectPatentMouData(tab) {
  const [rows] = await db.query(
    'SELECT * FROM project_patent_mou WHERE category = ? ORDER BY id',
    [tab]
  );
  return rows;
}

// PDF download (no file saved)
router.get('/pdf', async (req, res) => {
  const { ProjPatMouTab } = req.query;
  const { filterType, academicYear, dateFrom, dateTo } = req.query;
  const params = [];
  let sql = 'SELECT * FROM project_patent_mou';
  let whereClauses = [];

  let dateFieldStart;
  switch (ProjPatMouTab) {
    case 'Research and Development':
      dateFieldStart = 'research_date';
      break;
    case 'Consultancy':
      dateFieldStart = 'consultancy_date';
      break;
    case 'Patent':
      dateFieldStart = 'patent_year';
      break;
    case 'MoU':
      dateFieldStart = 'signedOnDate';
      break;
    default:
      dateFieldStart = null;
  }

  let orderBy = ' ORDER BY category, ';
  orderBy += dateFieldStart;

  // Filter by section/tab
  if (ProjPatMouTab) {
    whereClauses.push('category = ?');
    params.push(ProjPatMouTab);
  }

  // Filter by date or year
  if (filterType === 'date' && dateFrom && dateTo && dateFieldStart) {
    whereClauses.push(`${dateFieldStart} BETWEEN ? AND ?`);
    params.push(dateFrom, dateTo);
  }
  if (filterType === 'year' && academicYear && dateFieldStart) {
    // academicYear format: "2023-2024"
    if (ProjPatMouTab !== 'Patent') {
      let [startYear, endYear] = academicYear.split('-');
      endYear = `20${endYear}`
      whereClauses.push(`(YEAR(${dateFieldStart}) >= ? AND YEAR(${dateFieldStart}) <= ?)`);
      params.push(startYear, endYear);
    }
    else {
      whereClauses.push(`${dateFieldStart} = ? `);
      params.push(academicYear);
    }
  }

  if (whereClauses.length > 0) {
    sql += ' WHERE ' + whereClauses.join(' AND ');
  }
  sql += orderBy;

  const [data] = await db.query(sql, params);
  if (!data || data.length === 0) {
    return res.status(404).send('<script>alert("No data found!"); window.history.back();</script>');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=ProjectPatentMoU_Report.pdf`);

  const doc = new PDFDocument();
  doc.pipe(res);

  doc.fontSize(16).text(`Project / Patent / MoU - ${ProjPatMouTab}`, { bold: true });
  doc.moveDown();
  console.log([data]);
  data.forEach((row, index) => {
    doc.font('Helvetica-Bold').text(`Entry #${index + 1}`);
    if (row.category === 'Research and Development') {
      doc.font('Helvetica-Bold').text(`Title:`, { continued: true }).font('Helvetica').text(` ${row.title}`);
      doc.font('Helvetica-Bold').text(`Project ID:`, { continued: true }).font('Helvetica').text(` ${row.projectId}`);
      doc.font('Helvetica-Bold').text(`Awarding Agency:`, { continued: true }).font('Helvetica').text(` ${row.awardingAgency}`);
      doc.font('Helvetica-Bold').text(`Type of Funding:`, { continued: true }).font('Helvetica').text(` ${row.typeOfFunding}`);
      doc.font('Helvetica-Bold').text(`Funding Details:`, { continued: true }).font('Helvetica').text(` ${row.typeOfFunding === 'Government' ? 'N/A' : `${row.otherFundingDetails}`}`);
      // Principal Investigator
      if (row.pi_name) {
        let pi;
        try {
          pi = typeof row.pi_name === 'string' ? JSON.parse(row.pi_name) : row.pi_name;
        } catch (e) {
          pi = null;
        }
        if (pi) {
          const piFullName = [pi.salutation, pi.firstName, pi.middleName, pi.lastName].filter(Boolean).join(' ');
          doc.font('Helvetica-Bold').text(`Principal Investigator:`, { continued: true }).font('Helvetica').text(` ${piFullName} (${pi.designation}, ${pi.department}, ${pi.institute})`);
        } else {
          doc.font('Helvetica-Bold').text(`Principal Investigator:`, { continued: true }).font('Helvetica').text(`N/A`);
        }
      } else {
        doc.font('Helvetica-Bold').text(`Principal Investigator:`, { continued: true }).font('Helvetica').text(`N/A`);
      }

      // Co-Principal Investigator(s)
      if (row.co_pi_name) {
        let coPis;
        try {
          coPis = typeof row.co_pi_name === 'string' ? JSON.parse(row.co_pi_name) : row.co_pi_name;
        } catch (e) {
          coPis = [];
        }
        if (Array.isArray(coPis) && coPis.length > 0) {
          coPis.forEach((coPi, idx) => {
            const coPiFullName = [coPi.salutation, coPi.firstName, coPi.middleName, coPi.lastName].filter(Boolean).join(' ');
            doc.font('Helvetica-Bold').text(`Co-Principal Investigator #${idx + 1}:`, { continued: true }).font('Helvetica').text(` ${coPiFullName} (${coPi.designation}, ${coPi.department}, ${coPi.institute})`);
          });
        } else {
          doc.font('Helvetica-Bold').text(`Co-Principal Investigator:`, { continued: true }).font('Helvetica').text(`N/A`);
        }
      } else {
        doc.font('Helvetica-Bold').text(`Co-Principal Investigator:`, { continued: true }).font('Helvetica').text(`N/A`);
      }
      doc.font('Helvetica-Bold').text(`Duration:`, { continued: true }).font('Helvetica').text(` ${row.duration}`);
      doc.font('Helvetica-Bold').text(`Date:`, { continued: true }).font('Helvetica').text(` ${row.research_date}`);
      doc.font('Helvetica-Bold').text(`Amount :`, { continued: true }).font('Helvetica').text(` ${row.amount}`);
    }
    else if (row.category === 'Consultancy') {
      doc.font('Helvetica-Bold').text(`Title:`, { continued: true }).font('Helvetica').text(` ${row.title}`);
      doc.font('Helvetica-Bold').text(`Project ID:`, { continued: true }).font('Helvetica').text(` ${row.projectId}`);
      if (row.faculty_in_charge) {
        let faculty_in_charge;
        try {
          faculty_in_charge = typeof row.faculty_in_charge === 'string' ? JSON.parse(row.faculty_in_charge) : row.faculty_in_charge;
        } catch (e) {
          faculty_in_charge = [];
        }
        if (Array.isArray(faculty_in_charge) && faculty_in_charge.length > 0) {
          faculty_in_charge.forEach((coPi, idx) => {
            const coPiFullName = [coPi.salutation, coPi.firstName, coPi.middleName, coPi.lastName].filter(Boolean).join(' ');
            doc.font('Helvetica-Bold').text(`Faculty In-Charge #${idx + 1}:`, { continued: true }).font('Helvetica').text(` ${coPiFullName} (${coPi.designation}, ${coPi.department}, ${coPi.institute})`);
          });
        } else {
          doc.font('Helvetica-Bold').text(`Faculty In-Charge:`, { continued: true }).font('Helvetica').text(`N/A`);
        }
      } else {
        doc.font('Helvetica-Bold').text(`Faculty In-Charge:`, { continued: true }).font('Helvetica').text(`N/A`);
      }
      doc.font('Helvetica-Bold').text(`Collaboration Agency:`, { continued: true }).font('Helvetica').text(` ${row.collaborationAgency}`);
      doc.font('Helvetica-Bold').text(`Date:`, { continued: true }).font('Helvetica').text(` ${row.consultancy_date}`);
      doc.font('Helvetica-Bold').text(`Duration:`, { continued: true }).font('Helvetica').text(` ${row.duration}`);
      doc.font('Helvetica-Bold').text(`Amount:`, { continued: true }).font('Helvetica').text(` ${row.amount}`);
    }
    else if (row.category === 'Patent') {
      doc.font('Helvetica-Bold').text(`Type:`, { continued: true }).font('Helvetica').text(` ${row.patent_type}`);
      doc.font('Helvetica-Bold').text(`Title:`, { continued: true }).font('Helvetica').text(` ${row.title}`);
      // Remove incorrect reference to row.course_code
      if (row.inventors) {
        let inventors;
        try {
          inventors = typeof row.inventors === 'string' ? JSON.parse(row.inventors) : row.inventors;
        } catch (e) {
          inventors = [];
        }
        if (Array.isArray(inventors) && inventors.length > 0) {
          inventors.forEach((coPi, idx) => {
            const coPiFullName = [coPi.salutation, coPi.firstName, coPi.middleName, coPi.lastName].filter(Boolean).join(' ');
            doc.font('Helvetica-Bold').text(`Inventor #${idx + 1}:`, { continued: true }).font('Helvetica').text(` ${coPiFullName} (${coPi.designation}, ${coPi.department}, ${coPi.institute})`);
          });
        } else {
          doc.font('Helvetica-Bold').text(`Inventors:`, { continued: true }).font('Helvetica').text(`N/A`);
        }
      } else {
        doc.font('Helvetica-Bold').text(`Inventors:`, { continued: true }).font('Helvetica').text(`N/A`);
      }
      doc.font('Helvetica-Bold').text(`Agency:`, { continued: true }).font('Helvetica').text(` ${row.patent_agency}`);
      doc.font('Helvetica-Bold').text(`Month:`, { continued: true }).font('Helvetica').text(` ${row.patent_month}`);
      doc.font('Helvetica-Bold').text(`Year:`, { continued: true }).font('Helvetica').text(` ${row.patent_year}`);
    }
    else if (row.category === 'MoU') {
      doc.font('Helvetica-Bold').text(`Name of Organization:`, { continued: true }).font('Helvetica').text(` ${row.organizationName}`);
      doc.font('Helvetica-Bold').text(`Organization Sector:`, { continued: true }).font('Helvetica').text(` ${row.organizationSector}`);
      doc.font('Helvetica-Bold').text(`Department/Centre at institute:`, { continued: true }).font('Helvetica').text(` ${row.departmentAtInstitute}`);
      doc.font('Helvetica-Bold').text(`Signed on:`, { continued: true }).font('Helvetica').text(` ${String(row.signedOnDate).split('T')}`);
      doc.font('Helvetica-Bold').text(`Level:`, { continued: true }).font('Helvetica').text(` ${row.level}`);
      doc.font('Helvetica-Bold').text(`Type of MoU:`, { continued: true }).font('Helvetica').text(`${row.typeOfMoU}`);
      doc.font('Helvetica-Bold').text(`List of Activities :`, { continued: true }).font('Helvetica').text(` ${Array.isArray(row.activities)
        ? row.activities.join(',')
        : (typeof row.activities === 'string' && row.activities !== '' && row.activities !== 'null')
          ? row.activities
          : 'N/A'
        }`);
    }
    doc.moveDown();
  });

  doc.end();
  // No need to call res.end(), PDFKit will handle the stream ending.
});

// XLSX download (no file saved)
// // XLSX download (no file saved)
// router.get('/xlsx', async (req, res) => {
//   const { ProjPatMouTab } = req.query;
//   const { filterType, academicYear, dateFrom, dateTo } = req.query;
//   const params = [];
//   let sql = 'SELECT * FROM project_patent_mou';
//   let whereClauses = [];

//   let dateFieldStart;
//   switch (ProjPatMouTab) {
//     case 'Research and Development':
//       dateFieldStart = 'research_date';
//       break;
//     case 'Consultancy':
//       dateFieldStart = 'consultancy_date';
//       break;
//     case 'Patent':
//       dateFieldStart = 'patent_year';
//       break;
//     case 'MoU':
//       dateFieldStart = 'signedOnDate';
//       break;
//     default:
//       dateFieldStart = null;
//   }

//   let orderBy = ' ORDER BY category, ';
//   orderBy += dateFieldStart;

//   if (ProjPatMouTab) {
//     whereClauses.push('category = ?');
//     params.push(ProjPatMouTab);
//   }

//   if (filterType === 'date' && dateFrom && dateTo && dateFieldStart) {
//     whereClauses.push(`${dateFieldStart} BETWEEN ? AND ?`);
//     params.push(dateFrom, dateTo);
//   }
//   if (filterType === 'year' && academicYear && dateFieldStart) {
//     if (ProjPatMouTab !== 'Patent') {
//       let [startYear, endYear] = academicYear.split('-');
//       endYear = `20${endYear}`;
//       whereClauses.push(`(YEAR(${dateFieldStart}) >= ? AND YEAR(${dateFieldStart}) <= ?)`); 
//       params.push(startYear, endYear);
//     } else {
//       whereClauses.push(`${dateFieldStart} = ? `);
//       params.push(academicYear);
//     }
//   }

//   if (whereClauses.length > 0) {
//     sql += ' WHERE ' + whereClauses.join(' AND ');
//   }
//   sql += orderBy;

//   const [data] = await db.query(sql, params);
//   if (!data || data.length === 0) {
//     return res.status(404).send('<script>alert("No data found!"); window.history.back();</script>');
//   }

//   const workbook = new ExcelJS.Workbook();
//   const sheet = workbook.addWorksheet(`ProjectPatentMoU`);

//   // Header row
//   let headers = [];
//   if (ProjPatMouTab === 'Research and Development') {
//     headers = [
//       'Title', 'Project ID', 'Awarding Agency', 'Type of Funding', 'Funding Details',
//       'Principal Investigator', 'Co-Principal Investigators', 'Duration', 'Date', 'Amount'
//     ];
//   } else if (ProjPatMouTab === 'Consultancy') {
//     headers = [
//       'Title', 'Project ID', 'Faculty In-Charge', 'Collaboration Agency', 'Date', 'Duration', 'Amount'
//     ];
//   } else if (ProjPatMouTab === 'Patent') {
//     headers = [
//       'Type', 'Title', 'Inventors', 'Agency', 'Month', 'Year'
//     ];
//   } else if (ProjPatMouTab === 'MoU') {
//     headers = [
//       'Name of Organization', 'Organization Sector', 'Department/Centre at institute',
//       'Signed on', 'Level', 'Type of MoU', 'List of Activities'
//     ];
//   } else {
//     headers = Object.keys(data[0] || {});
//   }
//   sheet.addRow(headers);

//   data.forEach(row => {
//     let rowData = [];
//     if (ProjPatMouTab === 'Research and Development') {
//       // Principal Investigator
//       let pi = null;
//       try {
//         pi = typeof row.pi_name === 'string' ? JSON.parse(row.pi_name) : row.pi_name;
//       } catch (e) { pi = null; }
//       let piFullName = pi ? [pi.salutation, pi.firstName, pi.middleName, pi.lastName].filter(Boolean).join(' ') + ` (${pi.designation}, ${pi.department}, ${pi.institute})` : 'N/A';

//       // Co-Principal Investigators
//       let coPis = [];
//       try {
//         coPis = typeof row.co_pi_name === 'string' ? JSON.parse(row.co_pi_name) : row.co_pi_name;
//       } catch (e) { coPis = []; }
//       let coPiNames = Array.isArray(coPis) && coPis.length > 0
//         ? coPis.map(coPi => [coPi.salutation, coPi.firstName, coPi.middleName, coPi.lastName].filter(Boolean).join(' ') + ` (${coPi.designation}, ${coPi.department}, ${coPi.institute})`).join('; ')
//         : 'N/A';

//       rowData = [
//         row.title,
//         row.projectId,
//         row.awardingAgency,
//         row.typeOfFunding,
//         row.typeOfFunding === 'Government' ? 'N/A' : row.otherFundingDetails,
//         piFullName,
//         coPiNames,
//         row.duration,
//         row.research_date,
//         row.amount
//       ];
//     } else if (ProjPatMouTab === 'Consultancy') {
//       // Faculty In-Charge
//       let faculty_in_charge = [];
//       try {
//         faculty_in_charge = typeof row.faculty_in_charge === 'string' ? JSON.parse(row.faculty_in_charge) : row.faculty_in_charge;
//       } catch (e) { faculty_in_charge = []; }
//       let facultyNames = Array.isArray(faculty_in_charge) && faculty_in_charge.length > 0
//         ? faculty_in_charge.map(coPi => [coPi.salutation, coPi.firstName, coPi.middleName, coPi.lastName].filter(Boolean).join(' ') + ` (${coPi.designation}, ${coPi.department}, ${coPi.institute})`).join('; ')
//         : 'N/A';

//       rowData = [
//         row.title,
//         row.projectId,
//         facultyNames,
//         row.collaborationAgency,
//         row.consultancy_date,
//         row.duration,
//         row.amount
//       ];
//     } else if (ProjPatMouTab === 'Patent') {
//       // Inventors
//       let inventors = [];
//       try {
//         inventors = typeof row.inventors === 'string' ? JSON.parse(row.inventors) : row.inventors;
//       } catch (e) { inventors = []; }
//       let inventorNames = Array.isArray(inventors) && inventors.length > 0
//         ? inventors.map(coPi => [coPi.salutation, coPi.firstName, coPi.middleName, coPi.lastName].filter(Boolean).join(' ') + ` (${coPi.designation}, ${coPi.department}, ${coPi.institute})`).join('; ')
//         : 'N/A';

//       rowData = [
//         row.patent_type,
//         row.title,
//         inventorNames,
//         row.patent_agency,
//         row.patent_month,
//         row.patent_year
//       ];
//     } else if (ProjPatMouTab === 'MoU') {
//       // Activities
//       let activities = Array.isArray(row.activities)
//         ? row.activities.join(',')
//         : (typeof row.activities === 'string' && row.activities !== '' && row.activities !== 'null')
//           ? row.activities
//           : 'N/A';

//       rowData = [
//         row.organizationName,
//         row.organizationSector,
//         row.departmentAtInstitute,
//         String(row.signedOnDate).split('T')[0],
//         row.level,
//         row.typeOfMoU,
//         activities
//       ];
//     } else {
//       rowData = headers.map(h => row[h]);
//     }
//     sheet.addRow(rowData);
//   });

//   sheet.columns.forEach(col => {
//     let maxLength = col.header ? col.header.length : 10;
//     col.eachCell({ includeEmpty: true }, cell => {
//       const val = cell.value ? cell.value.toString().length : 10;
//       if (val > maxLength) maxLength = val;
//     });
//     col.width = maxLength + 2;
//   });

//   sheet.eachRow(row => {
//     row.eachCell(cell => {
//       cell.border = {
//         top: { style: 'thin' },
//         bottom: { style: 'thin' },
//         left: { style: 'thin' },
//         right: { style: 'thin' }
//       };
//       cell.font = { bold: row.number === 1 };
//     });
//   });

//   res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//   res.setHeader('Content-Disposition', `attachment; filename=ProjectPatentMoU_Report.xlsx`);
//   await workbook.xlsx.write(res);
//   res.end();
// });
router.get('/xlsx', async (req, res) => {
  const { filterType, academicYear, dateFrom, dateTo } = req.query;
  const params = [];
  let sql = 'SELECT * FROM project_patent_mou';
  const whereClauses = [];

  // Define category-specific date fields
  const dateFieldMap = {
    'Research and Development': 'research_date',
    'Consultancy': 'consultancy_date',
    'Patent': 'patent_year',
    'MoU': 'signedOnDate'
  };

  // Construct WHERE clause for filtering all records based on category-specific date fields
  const dateFilters = [];
  for (const [category, dateField] of Object.entries(dateFieldMap)) {
    if (filterType === 'date' && dateFrom && dateTo) {
      dateFilters.push(`(category = '${category}' AND ${dateField} BETWEEN ? AND ?)`);
      params.push(dateFrom, dateTo);
    } else if (filterType === 'year' && academicYear) {
      let [startYear, endYear] = academicYear.split('-');
      if (category !== 'Patent') {
        const startDate = `${startYear}-08-01`;
        const endDate = `20${endYear}-07-31`;
        dateFilters.push(`(category = '${category}' AND ${dateField} BETWEEN ? AND ?)`);
        params.push(startDate, endDate);
      } else {
        dateFilters.push(`(category = '${category}' AND (${dateField} = ? OR ${dateField} = ?))`);
        params.push(startYear, `20${endYear}`);
      }
    }
  }

  if (dateFilters.length > 0) {
    sql += ' WHERE ' + dateFilters.join(' OR ');
  }
  sql += ' ORDER BY category,research_date, consultancy_date, patent_year, signedOnDate';
  // console.log("sql:",sql)
  // console.log("params:",params)

  const [rows] = await db.query(sql, params);
  if (!rows || rows.length === 0) {
    return res.status(404).send('<script>alert("No data found!"); window.history.back();</script>');
  }

  const workbook = new ExcelJS.Workbook();

  const categoryHeaders = {
    'Research and Development': [
      'S. No.', 'Title', 'Project ID', 'Awarding Agency', 'Type of Funding', 'Funding Details',
      'Principal Investigator', 'Co-Principal Investigators', 'Duration', 'Date', 'Amount'
    ],
    'Consultancy': [
      'S. No.', 'Title', 'Project ID', 'Faculty In-Charge', 'Collaboration Agency', 'Date', 'Duration', 'Amount'
    ],
    'Patent': [
      'S. No.', 'Type', 'Title', 'Inventors', 'Agency', 'Month', 'Year'
    ],
    'MoU': [
      'S. No.', 'Name of Organization', 'Organization Sector', 'Department/Centre at institute',
      'Signed on', 'Level', 'Type of MoU', 'List of Activities'
    ]
  };

  const grouped = rows.reduce((acc, row) => {
    if (!acc[row.category]) acc[row.category] = [];
    acc[row.category].push(row);
    return acc;
  }, {});

  for (const category of Object.keys(grouped)) {
    const sheet = workbook.addWorksheet(category);
    const data = grouped[category];
    let rowIndex = 1;

    // Title row
    const title = `List of ${category} (Sorted by ${filterType === 'year' ? `Year ${academicYear}` : `Date ${dateFrom} to ${dateTo}`
      })`;
    sheet.mergeCells(`A${rowIndex}:${String.fromCharCode(64 + categoryHeaders[category].length)}${rowIndex}`);
    sheet.getCell(`A${rowIndex}`).value = title;
    sheet.getCell(`A${rowIndex}`).font = { bold: true, size: 20 };
    sheet.getCell(`A${rowIndex}`).alignment = { horizontal: 'center' };
    sheet.addRow([]);
    rowIndex += 1;

    // Header row
    headerRow = sheet.addRow(categoryHeaders[category]);
    rowIndex++;

    headerRow.font = { bold: true };

    data.forEach((row, idx) => {
      let rowData = [];
      if (category === 'Research and Development') {
        let pi = safeParse(row.pi_name);
        let piName = pi ? formatPerson(pi) : 'N/A';

        let coPis = safeParse(row.co_pi_name);
        let coPiNames = Array.isArray(coPis) && coPis.length
          ? coPis.map(formatPerson).join('; ')
          : 'N/A';

        rowData = [
          idx + 1,
          row.title,
          row.projectId,
          row.awardingAgency,
          row.typeOfFunding,
          row.typeOfFunding === 'Government' ? 'N/A' : row.otherFundingDetails,
          piName,
          coPiNames,
          row.duration,
          String(row.research_date).slice(0, 15),
          row.amount
        ];
      } else if (category === 'Consultancy') {
        const faculty = safeParse(row.faculty_in_charge);
        const names = Array.isArray(faculty) && faculty.length
          ? faculty.map(formatPerson).join('; ')
          : 'N/A';
        rowData = [
          idx + 1,
          row.title,
          row.projectId,
          names,
          row.collaborationAgency,
          String(row.consultancy_date).slice(0, 15),
          row.duration,
          row.amount
        ];
      } else if (category === 'Patent') {
        const inventors = safeParse(row.inventors);
        const inventorNames = Array.isArray(inventors) && inventors.length
          ? inventors.map(formatPerson).join('; ')
          : 'N/A';
        rowData = [
          idx + 1,
          row.patent_type,
          row.title,
          inventorNames,
          row.patent_agency,
          row.patent_month,
          row.patent_year
        ];
      } else if (category === 'MoU') {
        const activities = Array.isArray(row.activities)
          ? row.activities.join(',')
          : (typeof row.activities === 'string' && row.activities !== '' && row.activities !== 'null')
            ? row.activities
            : 'N/A';
        rowData = [
          idx + 1,
          row.organizationName,
          row.organizationSector,
          row.departmentAtInstitute,
          String(row.signedOnDate).slice(0, 15),
          row.level,
          row.typeOfMoU,
          activities
        ];
      }
      sheet.addRow(rowData);
    });

    // Auto width
    sheet.columns.forEach(col => {
      let maxLength = col.header ? col.header.length : 10;
      col.eachCell({ includeEmpty: true }, cell => {
        if (cell.row <= 2) return;
        const val = cell.value ? cell.value.toString().length : 10;
        if (val > maxLength) maxLength = val;
      });
      col.width = maxLength + 2;
    });

    // Border
    sheet.eachRow(row =>
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      })
    );
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=ProjectPatentMoU_Report.xlsx`);
  await workbook.xlsx.write(res);
  res.end();

  function safeParse(json) {
    try {
      return typeof json === 'string' ? JSON.parse(json) : json;
    } catch {
      return null;
    }
  }

  function formatPerson(p) {
    return [p.salutation, p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ') +
      ` (${p.designation}, ${p.department}, ${p.institute})`;
  }
});


// DOCX download (no file saved)
router.get('/docx', async (req, res) => {
  const { ProjPatMouTab } = req.query;
  const { filterType, academicYear, dateFrom, dateTo } = req.query;
  const params = [];
  let sql = 'SELECT * FROM project_patent_mou';
  let whereClauses = [];

  let dateFieldStart;
  switch (ProjPatMouTab) {
    case 'Research and Development':
      dateFieldStart = 'research_date';
      break;
    case 'Consultancy':
      dateFieldStart = 'consultancy_date';
      break;
    case 'Patent':
      dateFieldStart = 'patent_year';
      break;
    case 'MoU':
      dateFieldStart = 'signedOnDate';
      break;
    default:
      dateFieldStart = null;
  }

  let orderBy = ' ORDER BY category, ';
  orderBy += dateFieldStart;

  if (ProjPatMouTab) {
    whereClauses.push('category = ?');
    params.push(ProjPatMouTab);
  }

  if (filterType === 'date' && dateFrom && dateTo && dateFieldStart) {
    whereClauses.push(`${dateFieldStart} BETWEEN ? AND ?`);
    params.push(dateFrom, dateTo);
  }
  if (filterType === 'year' && academicYear && dateFieldStart) {
    if (ProjPatMouTab !== 'Patent') {
      let [startYear, endYear] = academicYear.split('-');
      endYear = `20${endYear}`;
      whereClauses.push(`(YEAR(${dateFieldStart}) >= ? AND YEAR(${dateFieldStart}) <= ?)`);
      params.push(startYear, endYear);
    } else {
      whereClauses.push(`${dateFieldStart} = ? `);
      params.push(academicYear);
    }
  }

  if (whereClauses.length > 0) {
    sql += ' WHERE ' + whereClauses.join(' AND ');
  }
  sql += orderBy;

  const [data] = await db.query(sql, params);
  if (!data || data.length === 0) {
    return res.status(404).send('<script>alert("No data found!"); window.history.back();</script>');
  }

  const children = [];

  children.push(new Paragraph({
    text: `Project / Patent / MoU - ${ProjPatMouTab}`,
    heading: HeadingLevel.HEADING_1,
    bold: true
  }));

  data.forEach((row, index) => {
    children.push(new Paragraph({
      text: `Entry #${index + 1}`,
      heading: HeadingLevel.HEADING_2,
    }));

    if (ProjPatMouTab === 'Research and Development') {
      // Principal Investigator
      let pi = null;
      try {
        pi = typeof row.pi_name === 'string' ? JSON.parse(row.pi_name) : row.pi_name;
      } catch (e) { pi = null; }
      let piFullName = pi ? [pi.salutation, pi.firstName, pi.middleName, pi.lastName].filter(Boolean).join(' ') + ` (${pi.designation}, ${pi.department}, ${pi.institute})` : 'N/A';

      // Co-Principal Investigators
      let coPis = [];
      try {
        coPis = typeof row.co_pi_name === 'string' ? JSON.parse(row.co_pi_name) : row.co_pi_name;
      } catch (e) { coPis = []; }
      let coPiNames = Array.isArray(coPis) && coPis.length > 0
        ? coPis.map(coPi => [coPi.salutation, coPi.firstName, coPi.middleName, coPi.lastName].filter(Boolean).join(' ') + ` (${coPi.designation}, ${coPi.department}, ${coPi.institute})`).join('; ')
        : 'N/A';

      children.push(
        new Paragraph({ children: [new TextRun({ text: 'Title: ', bold: true }), new TextRun(row.title || '-')] }),
        new Paragraph({ children: [new TextRun({ text: 'Project ID: ', bold: true }), new TextRun(row.projectId || '-')] }),
        new Paragraph({ children: [new TextRun({ text: 'Awarding Agency: ', bold: true }), new TextRun(row.awardingAgency || '-')] }),
        new Paragraph({ children: [new TextRun({ text: 'Type of Funding: ', bold: true }), new TextRun(row.typeOfFunding || '-')] }),
        new Paragraph({ children: [new TextRun({ text: 'Funding Details: ', bold: true }), new TextRun(row.typeOfFunding === 'Government' ? 'N/A' : (row.otherFundingDetails || '-'))] }),
        new Paragraph({ children: [new TextRun({ text: 'Principal Investigator: ', bold: true }), new TextRun(piFullName)] }),
        new Paragraph({ children: [new TextRun({ text: 'Co-Principal Investigators: ', bold: true }), new TextRun(coPiNames)] }),
        new Paragraph({ children: [new TextRun({ text: 'Duration: ', bold: true }), new TextRun(row.duration || '-')] }),
        new Paragraph({ children: [new TextRun({ text: 'Date: ', bold: true }), new TextRun(row.research_date || '-')] }),
        new Paragraph({ children: [new TextRun({ text: 'Amount: ', bold: true }), new TextRun(row.amount || '-')] }),
      );
    } else if (ProjPatMouTab === 'Consultancy') {
      // Faculty In-Charge
      let faculty_in_charge = [];
      try {
        faculty_in_charge = typeof row.faculty_in_charge === 'string' ? JSON.parse(row.faculty_in_charge) : row.faculty_in_charge;
      } catch (e) { faculty_in_charge = []; }
      let facultyNames = Array.isArray(faculty_in_charge) && faculty_in_charge.length > 0
        ? faculty_in_charge.map(coPi => [coPi.salutation, coPi.firstName, coPi.middleName, coPi.lastName].filter(Boolean).join(' ') + ` (${coPi.designation}, ${coPi.department}, ${coPi.institute})`).join('; ')
        : 'N/A';

      children.push(
        new Paragraph({ children: [new TextRun({ text: 'Title: ', bold: true }), new TextRun(row.title || '-')] }),
        new Paragraph({ children: [new TextRun({ text: 'Project ID: ', bold: true }), new TextRun(row.projectId || '-')] }),
        new Paragraph({ children: [new TextRun({ text: 'Faculty In-Charge: ', bold: true }), new TextRun(facultyNames)] }),
        new Paragraph({ children: [new TextRun({ text: 'Collaboration Agency: ', bold: true }), new TextRun(row.collaborationAgency || '-')] }),
        new Paragraph({ children: [new TextRun({ text: 'Date: ', bold: true }), new TextRun(row.consultancy_date || '-')] }),
        new Paragraph({ children: [new TextRun({ text: 'Duration: ', bold: true }), new TextRun(row.duration || '-')] }),
        new Paragraph({ children: [new TextRun({ text: 'Amount: ', bold: true }), new TextRun(row.amount || '-')] }),
      );
    } else if (ProjPatMouTab === 'Patent') {
      // Inventors
      let inventors = [];
      try {
        inventors = typeof row.inventors === 'string' ? JSON.parse(row.inventors) : row.inventors;
      } catch (e) { inventors = []; }
      let inventorNames = Array.isArray(inventors) && inventors.length > 0
        ? inventors.map(coPi => [coPi.salutation, coPi.firstName, coPi.middleName, coPi.lastName].filter(Boolean).join(' ') + ` (${coPi.designation}, ${coPi.department}, ${coPi.institute})`).join('; ')
        : 'N/A';

      children.push(
        new Paragraph({ children: [new TextRun({ text: 'Type: ', bold: true }), new TextRun(row.patent_type || '-')] }),
        new Paragraph({ children: [new TextRun({ text: 'Title: ', bold: true }), new TextRun(row.title || '-')] }),
        new Paragraph({ children: [new TextRun({ text: 'Inventors: ', bold: true }), new TextRun(inventorNames)] }),
        new Paragraph({ children: [new TextRun({ text: 'Agency: ', bold: true }), new TextRun(row.patent_agency || '-')] }),
        new Paragraph({ children: [new TextRun({ text: 'Month: ', bold: true }), new TextRun(row.patent_month || '-')] }),
        new Paragraph({ children: [new TextRun({ text: 'Year: ', bold: true }), new TextRun(row.patent_year || '-')] }),
      );
    } else if (ProjPatMouTab === 'MoU') {
      let activities = Array.isArray(row.activities)
        ? row.activities.join(',')
        : (typeof row.activities === 'string' && row.activities !== '' && row.activities !== 'null')
          ? row.activities
          : 'N/A';

      children.push(
        new Paragraph({ children: [new TextRun({ text: 'Name of Organization: ', bold: true }), new TextRun(row.organizationName || '-')] }),
        new Paragraph({ children: [new TextRun({ text: 'Organization Sector: ', bold: true }), new TextRun(row.organizationSector || '-')] }),
        new Paragraph({ children: [new TextRun({ text: 'Department/Centre at institute: ', bold: true }), new TextRun(row.departmentAtInstitute || '-')] }),
        new Paragraph({ children: [new TextRun({ text: 'Signed on: ', bold: true }), new TextRun(String(row.signedOnDate).split('T')[0] || '-')] }),
        new Paragraph({ children: [new TextRun({ text: 'Level: ', bold: true }), new TextRun(row.level || '-')] }),
        new Paragraph({ children: [new TextRun({ text: 'Type of MoU: ', bold: true }), new TextRun(row.typeOfMoU || '-')] }),
        new Paragraph({ children: [new TextRun({ text: 'List of Activities: ', bold: true }), new TextRun(activities)] }),
      );
    } else {
      for (const key in row) {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${key}: `, bold: true }),
            new TextRun(`${row[key] || '-'}`)
          ]
        }));
      }
    }
  });

  const docxFile = new Document({ sections: [{ properties: {}, children }] });
  const buffer = await Packer.toBuffer(docxFile);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename=ProjectPatentMoU_Report.docx`);
  res.send(buffer);
});

module.exports = router;
