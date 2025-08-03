const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../db');
const multer = require('multer');
const { jsPDF } = require('jspdf');
const { autoTable } = require('jspdf-autotable');
const ExcelJS = require('exceljs');
// const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType } = require('docx');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  WidthType,
  HeadingLevel,
} = require('docx');
// Middleware to parse URL-encoded bodies
// router.use(express.urlencoded({ extended: true }));
// Middleware to parse JSON bodies
router.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/EventOrganized');
    // Ensure uploads folder exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  }
});


const upload = multer({ storage });

// Route: POST /api/event-organized
router.post('/', upload.fields([
  { name: 'poster', maxCount: 1 },
  { name: 'schedule', maxCount: 1 },
  { name: 'abstract', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      type = null,
      mode = null,
      industry = null,
      sponsoringAgency = null,
      title = null,
      abbreviation = null,
      organizer = null,
      venue_city = null,
      venue_state = null,
      venue_country = null,
      from = null,
      to = null,
      numParticipants = null,
      photoLink = null
    } = req.body;
    console.log("Industry:", industry);

    console.log("Received data:", req.body);
    let coordinators = [];
    let speakers = [];

    try {
      coordinators = req.body.coordinators ? JSON.parse(req.body.coordinators) : null;
      speakers = req.body.speakers ? JSON.parse(req.body.speakers) : null;
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid JSON for coordinators/speakers' });
    }

    // console.log("Files received:", req.files);
    const posterPath = req.files?.poster?.[0]?.path || null;
    const schedulePath = req.files?.schedule?.[0]?.path || null;
    const abstractPath = req.files?.abstract?.[0]?.path || null;

    await db.query(
      `INSERT INTO event_organized 
            (type, mode,industry, sponsoringAgency, title, abbreviation, organizer, 
             venue_city, venue_state, venue_country, fromDate, toDate, numParticipants, 
             photoLink, posterPath, schedulePath, abstractPath, coordinators, speakers) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        type, mode, industry, sponsoringAgency, title, abbreviation, organizer,
        venue_city, venue_state, venue_country, from, to, numParticipants,
        photoLink, posterPath, schedulePath, abstractPath, JSON.stringify(coordinators), JSON.stringify(speakers)
      ]
    );
    console.log("Event organized entry saved successfully.");
    res.status(200).json({ success: true, message: 'Event organized entry saved successfully.' });
  } catch (error) {
    console.error("Error saving event organized data:", error.message);
    res.status(500).json({ error: "Server error while saving event organized data." });
  }
});

router.put('/:id', upload.fields([
  { name: 'poster', maxCount: 1 },
  { name: 'schedule', maxCount: 1 },
  { name: 'abstract', maxCount: 1 }
]), async (req, res) => {
  const id = req.params.id;
  try {
    const {
      type = null,
      mode = null,
      industry = null,
      sponsoringAgency = null,
      title = null,
      abbreviation = null,
      organizer = null,
      venue_city = null,
      venue_state = null,
      venue_country = null,
      from = null,
      to = null,
      numParticipants = null,
      photoLink = null
    } = req.body;

    let coordinators = [];
    let speakers = [];

    try {
      coordinators = req.body.coordinators ? JSON.parse(req.body.coordinators) : null;
      speakers = req.body.speakers ? JSON.parse(req.body.speakers) : null;
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid JSON for coordinators/speakers' });
    }

    const posterPath = req.files?.poster?.[0]?.path || null;
    const schedulePath = req.files?.schedule?.[0]?.path || null;
    const abstractPath = req.files?.abstract?.[0]?.path || null;

    const query =
      `UPDATE event_organized 
             SET type=?, mode=?, industry=?, sponsoringAgency=?, title=?, abbreviation=?, organizer=?, 
                 venue_city=?, venue_state=?, venue_country=?, fromDate=?, toDate=?, numParticipants=?, 
                 coordinators=?, speakers=?,photoLink=?
                 ${posterPath ? ', posterPath = ?' : ''}
                 ${schedulePath ? ', schedulePath = ?' : ''}
                 ${abstractPath ? ', abstractPath = ?' : ''}  
                 WHERE id=?`

    const values = [
      type, mode, industry, sponsoringAgency, title, abbreviation, organizer,
      venue_city, venue_state, venue_country, from, to, numParticipants,
      JSON.stringify(coordinators), JSON.stringify(speakers), photoLink
    ]
    if (posterPath) {
      values.push(posterPath); // Add certificate path only if it exists
    }
    if (schedulePath) {
      values.push(schedulePath); // Add certificate path only if it exists
    }
    if (abstractPath) {
      values.push(abstractPath); // Add certificate path only if it exists
    }
    values.push(id);
    await db.query(query, values);

    console.log("Event organized entry updated successfully.");
    res.status(200).json({ success: true, message: 'Event organized entry updated successfully.' });
  } catch (error) {
    console.error("Error updating event organized data:", error.message);
    res.status(500).json({ error: "Server error while updating event organized data." });
  }
});

function formatNames(jsonString) {
  try {
    const arr = JSON.parse(jsonString);
    return Array.isArray(arr)
      ? arr.map(p => `${p.firstName || ''} ${p.middleName || ''} ${p.lastName || ''}`.trim()).join(', ')
      : '';
  } catch {
    return '';
  }
}

const PDFDocument = require('pdfkit');
const { type } = require('os');

router.get('/pdf', async (req, res) => {
  try {
    const { filterType, academicYear, dateFrom, dateTo } = req.query;
    const params = [];
    let sql = 'SELECT * FROM event_organized WHERE'
    if (filterType === 'date' && dateFrom && dateTo) {
      sql += ` fromDate BETWEEN ? AND ? OR toDate BETWEEN ? AND ?`;
      params.push(dateFrom, dateTo);
      params.push(dateFrom, dateTo);
      console.log('dateFrom', dateFrom);
      console.log('dateTo', dateTo);
    }
    if (filterType === 'year' && academicYear) {
      // academicYear format: "2023-2024"
      const [startYear, endYear] = academicYear.split('-');
      sql += ' (YEAR(fromDate) >= ? AND YEAR(fromDate) <= ?)';
      params.push(startYear, endYear);
    }
    sql += ' ORDER BY fromDate ';
    const [rows] = await db.query(sql, params);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Event_Organized_Report.pdf"');

    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(20).text('Event Organized Report', { underline: true });
    doc.moveDown();

    rows.forEach((row, idx) => {
      const coordinatorNames = formatNames(row.coordinators);
      const speakerNames = formatNames(row.speakers);

      doc.fontSize(12).text(`${idx + 1}. ${row.title || 'N/A'}`, { bold: true });
      doc.font('Helvetica-Bold').text('Type: ', { continued: true }).font('Helvetica').text(`${row.type || 'N/A'}`);
      doc.font('Helvetica-Bold').text('Mode: ', { continued: true }).font('Helvetica').text(`${row.mode || 'N/A'}`);
      doc.font('Helvetica-Bold').text('Industry: ', { continued: true }).font('Helvetica').text(`${row.industry || 'N/A'}`);
      doc.font('Helvetica-Bold').text('Organizer: ', { continued: true }).font('Helvetica').text(`${row.organizer || 'N/A'}`);
      doc.font('Helvetica-Bold').text('Venue: ', { continued: true }).font('Helvetica').text(
        `${row.venue_city || 'N/A'}, ${row.venue_state || 'N/A'}, ${row.venue_country || 'N/A'}`
      );
      doc.font('Helvetica-Bold').text('From: ', { continued: true }).font('Helvetica').text(`${row.fromDate || 'N/A'}`, { continued: true });
      doc.font('Helvetica-Bold').text('  To: ', { continued: true }).font('Helvetica').text(`${row.toDate || 'N/A'}`);
      doc.font('Helvetica-Bold').text('Participants: ', { continued: true }).font('Helvetica').text(
        row.numParticipants != null ? row.numParticipants : 'N/A'
      );
      doc.font('Helvetica-Bold').text('Photo Link: ', { continued: true }).font('Helvetica').text(`${row.photoLink || 'N/A'}`);
      doc.font('Helvetica-Bold').text('Coordinators: ', { continued: true }).font('Helvetica').text(
        Array.isArray(row.coordinators)
          ? (row.coordinators.length
            ? row.coordinators.map(p => `${p.firstName || ''} ${p.middleName || ''} ${p.lastName || ''}`.trim()).join(', ')
            : 'N/A')
          : (formatNames(row.coordinators) || 'N/A')
      );
      doc.font('Helvetica-Bold').text('Speakers: ', { continued: true }).font('Helvetica').text(
        Array.isArray(row.speakers)
          ? (row.speakers.length
            ? row.speakers.map(p => `${p.firstName || ''} ${p.middleName || ''} ${p.lastName || ''}`.trim()).join(', ')
            : 'N/A')
          : (formatNames(row.speakers) || 'N/A')
      );
      doc.moveDown();
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error('PDF generation failed:', err);
    res.status(500).json({ error: 'PDF generation failed.' });
  }
});

router.get('/xlsx', async (req, res) => {
  try {
    const { filterType, academicYear, dateFrom, dateTo } = req.query;
    const params = [];
    let sql = 'SELECT * FROM event_organized WHERE'
    sql += ` fromDate BETWEEN ? AND ? OR toDate BETWEEN ? AND ?`;
    if (filterType === 'date' && dateFrom && dateTo) {
      params.push(dateFrom, dateTo);
      params.push(dateFrom, dateTo);
      console.log('dateFrom', dateFrom);
      console.log('dateTo', dateTo);
    }
    if (filterType === 'year' && academicYear) {
      let [startYear, endYear] = academicYear.split('-');
      startYear = `${startYear}-08-01`;
      endYear = `20${endYear}-07-31`;

      params.push(startYear, endYear);
      params.push(startYear, endYear);
    }
    sql += ' ORDER BY type, fromDate ';
    const [grouped] = await db.query(sql, params);

    const rows = {};
    for (const entry of grouped) {
      if (!rows[entry.type]) rows[entry.type] = [];
      rows[entry.type].push(entry);
    }

    if (!rows || rows.length === 0) {
      return res.status(404).send('<script>alert("No data found!"); window.history.back();</script>');
    }
    // console.log(`Rows:`);
    // rows.forEach((row, idx) => {
    //   console.log(row.coordinators);
    // })
    const workbook = new ExcelJS.Workbook();
    // const sheet = workbook.addWorksheet();

    const headers = [
      'S.No', 'Mode', 'Sponsoring Agency', 'Title', 'Abbreviation', 'Coordinators', 'Organizer',
      'Venue City', 'Venue State', 'Venue Country', 'From', 'To', 'Participants', 'Photo Link',
    ];
    const headersDL = [
      'S.No', 'Mode', 'Sponsoring Agency', 'Title', 'Abbreviation', 'Speakers', 'Coordinators', 'Organizer',
      'Venue City', 'Venue State', 'Venue Country', 'From', 'To', 'Participants', 'Photo Link'
    ];
    const headersIV = [
      'S.No', 'Industry\'s Name', 'From', 'To', 'Participants', 'Photo Link'
    ];

    // types.forEach((type, idx) => {
    for (const type in rows) {

      const sheet = workbook.addWorksheet(type.replace(/\//g, '&'));

      const heading = `List of ${type} (Sorted by ${filterType === 'year' ? `Year ${academicYear}` : `Date ${dateFrom} - ${dateTo}`})`;
      const headingRow = sheet.addRow([heading]);
      sheet.addRow([]);

      let headerRow;
      type === 'Distinguised Lecture' ? (headerRow = sheet.addRow(headersDL),sheet.mergeCells(`A1:01`)) :
      (type === 'Industrial Visit' ? (headerRow = sheet.addRow(headersIV),sheet.mergeCells(`A1:F1`)) :
      (headerRow = sheet.addRow(headers)),sheet.mergeCells(`A1:N1`));
      
      headerRow.font = { bold: true };
      headingRow.font = { bold: true, size: 20 };
      headingRow.alignment = { horizontal: 'center' }

      let rowElement; 
      rows[type].forEach((row, idx) => {
        if (type !== 'Distinguised Lecture' && type !== 'Industrial Visit') {
          // rows.forEach((row, idx) => {
          rowElement = sheet.addRow([
            idx + 1,
            row.mode || 'N/A',
            row.sponsoringAgency || 'N/A',
            row.title || 'N/A',
            row.abbreviation || 'N/A',
            Array.isArray(row.coordinators)
              ? row.coordinators.map(p => `${p.firstName || ''} ${p.middleName || ''} ${p.lastName || ''}`.trim()).join(', ') || 'N/A'
              : (formatNames(row.coordinators) || 'N/A'),
            row.organizer || 'N/A',
            row.venue_city || 'N/A',
            row.venue_state || 'N/A',
            row.venue_country || 'N/A',
            row.fromDate
              ? new Date(row.fromDate).toISOString().slice(0, 10)
              : 'N/A',
            row.toDate
              ? new Date(row.toDate).toISOString().slice(0, 10)
              : 'N/A',
            row.numParticipants != null ? row.numParticipants : 'N/A',
            row.photoLink || 'N/A'
          ]);
          // });
        }
        else if (type === 'Distinguished Lecture') {
          // rows.forEach((row, idx) => {
          // sheet.addRow([
          rowElement = sheet.addRow([
            idx + 1,
            row.mode || 'N/A',
            row.sponsoringAgency || 'N/A',
            row.title || 'N/A',
            row.abbreviation || 'N/A',
            Array.isArray(row.speakers)
              ? row.speakers.map(p => `${p.firstName || ''} ${p.middleName || ''} ${p.lastName || ''}`.trim()).join(', ') || 'N/A'
              : (formatNames(row.speakers) || 'N/A'),
            Array.isArray(row.coordinators)
              ? row.coordinators.map(p => `${p.firstName || ''} ${p.middleName || ''} ${p.lastName || ''}`.trim()).join(', ') || 'N/A'
              : (formatNames(row.coordinators) || 'N/A'),
            row.organizer || 'N/A',
            row.venue_city || 'N/A',
            row.venue_state || 'N/A',
            row.venue_country || 'N/A',
            row.fromDate
              ? new Date(row.fromDate).toISOString().slice(0, 10)
              : 'N/A',
            row.toDate
              ? new Date(row.toDate).toISOString().slice(0, 10)
              : 'N/A',
            row.numParticipants != null ? row.numParticipants : 'N/A',
            row.photoLink || 'N/A',
          ]);
          // });
        }
        else if (type === 'Industrial Visit') {
          // rows.forEach((row, idx) => {
          //   sheet.addRow([
          rowElement = sheet.addRow([
            idx + 1,
            row.industry || 'N/A',
            row.fromDate
              ? new Date(row.fromDate).toISOString().slice(0, 10)
              : 'N/A',
            row.toDate
              ? new Date(row.toDate).toISOString().slice(0, 10)
              : 'N/A',
            row.numParticipants != null ? row.numParticipants : 'N/A',
            row.photoLink || 'N/A',
          ]);
          // });
        }

        rowElement.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });

      });


      sheet.columns.forEach((col, i) => {
        let maxLength = 10;
        col.eachCell({ includeEmpty: false }, cell => {
          if (cell.row <= 2) return;
          const len = String(cell.value || '').length;
          if (len > maxLength) maxLength = len;
        });
        col.width = maxLength + 2;
      });

      sheet.eachRow({ includeEmpty: false }, row => {
        row.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' }, bottom: { style: 'thin' },
            left: { style: 'thin' }, right: { style: 'thin' }
          };
        });
      });
      // Add borders and auto width
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Event_Organized_Report.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('XLSX error:', err);
    res.status(500).json({ error: 'XLSX generation failed.' });
  }
});

router.get('/docx', async (req, res) => {
  try {
    const { filterType, academicYear, dateFrom, dateTo } = req.query;
    const params = [];
    let sql = 'SELECT * FROM event_organized WHERE'
    if (filterType === 'date' && dateFrom && dateTo) {
      sql += ` fromDate BETWEEN ? AND ? OR toDate BETWEEN ? AND ?`;
      params.push(dateFrom, dateTo);
      params.push(dateFrom, dateTo);
      console.log('dateFrom', dateFrom);
      console.log('dateTo', dateTo);
    }
    if (filterType === 'year' && academicYear) {
      // academicYear format: "2023-2024"
      const [startYear, endYear] = academicYear.split('-');
      sql += ' (YEAR(fromDate) >= ? AND YEAR(fromDate) <= ?)';
      params.push(startYear, endYear);
    }
    sql += ' ORDER BY fromDate ';
    const [rows] = await db.query(sql, params);

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: "Event Organized Report",
              heading: HeadingLevel.HEADING1,
            }),
            ...rows.map((row, idx) => {
              // const coordinatorNames = formatNames(row.coordinators);
              // const speakerNames = formatNames(row.speakers);

              return new Paragraph({
                children: [
                  new TextRun({ text: `\n${idx + 1}. ${row.title}`, bold: true }),
                  new TextRun({ text: `\nType: `, bold: true }),
                  new TextRun(`${row.type || 'N/A'}`),
                  new TextRun({ text: `\nMode: `, bold: true }),
                  new TextRun(`${row.mode || 'N/A'}`),
                  new TextRun({ text: `\nIndustry: `, bold: true }),
                  new TextRun(`${row.industry || 'N/A'}`),
                  new TextRun({ text: `\nOrganizer: `, bold: true }),
                  new TextRun(`${row.organizer || 'N/A'}`),
                  new TextRun({ text: `\nVenue: `, bold: true }),
                  new TextRun(`${row.venue_city || 'N/A'}, ${row.venue_state || 'N/A'}, ${row.venue_country || 'N/A'}`),
                  new TextRun({ text: `\nFrom: `, bold: true }),
                  new TextRun(`${row.fromDate || 'N/A'}`),
                  new TextRun({ text: ` To: `, bold: true }),
                  new TextRun(`${row.toDate || 'N/A'}`),
                  new TextRun({ text: `\nParticipants: `, bold: true }),
                  new TextRun(`${row.numParticipants != null ? row.numParticipants : 'N/A'}`),
                  new TextRun({ text: `\nPhoto Link: `, bold: true }),
                  new TextRun(`${row.photoLink || 'N/A'}`),
                  new TextRun({ text: `\nCoordinators: `, bold: true }),
                  new TextRun(`${Array.isArray(row.coordinators)
                    ? row.coordinators.map(p => `${p.firstName || ''} ${p.middleName || ''} ${p.lastName || ''}`.trim()).join(', ') || 'N/A'
                    : (formatNames(row.coordinators) || 'N/A')}`),
                  new TextRun({ text: `\nSpeakers: `, bold: true }),
                  new TextRun(`${Array.isArray(row.speakers)
                    ? row.speakers.map(p => `${p.firstName || ''} ${p.middleName || ''} ${p.lastName || ''}`.trim()).join(', ') || 'N/A'
                    : (formatNames(row.speakers) || 'N/A')}`),
                  new TextRun('\n---'),
                ],
              });
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="Event_Organized_Report.docx"');
    res.send(buffer);
  } catch (err) {
    console.error('DOCX generation failed:', err);
    res.status(500).json({ error: 'DOCX generation failed.' });
  }
});

// Export the router to be used in server.js or app.js
module.exports = router;