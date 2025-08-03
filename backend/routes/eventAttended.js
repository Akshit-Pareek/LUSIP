const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    WidthType,
    HeadingLevel,
} = require('docx');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/EventAttended');
        // Ensure uploads folder exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `${timestamp}-${file.fieldname}${ext}`);
    }
});

const upload = multer({ storage: storage });

// POST route to handle events attended form
router.post('/', upload.single('certificate'), async (req, res) => {
    const {
        typeOfEvent,
        sponsoringAgency,
        title,
        abbreviation,
        organizer,
        city,
        state,
        country,
        fromDate,
        toDate
    } = req.body;

    const certificatePath = req.file ? req.file.path : null;

    try {
        const query = `
            INSERT INTO events_attended (
                type_of_event,
                sponsoring_agency,
                title,
                abbreviation,
                organizer,
                city,
                state,
                country,
                from_date,
                to_date,
                certificate_path
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            typeOfEvent,
            sponsoringAgency,
            title,
            abbreviation,
            organizer,
            city,
            state,
            country,
            fromDate,
            toDate,
            certificatePath
        ];

        await pool.query(query, values);

        res.status(201).json({ message: 'Event attended data submitted successfully.' });
    } catch (err) {
        console.error('Error saving event attended data:', err);
        res.status(500).json({ error: 'Server error while saving event attended data.' });
    }
});

router.put('/:id', upload.single('certificate'), async (req, res) => {
    const id = req.params.id;
    const {
        typeOfEvent,
        sponsoringAgency,
        title,
        abbreviation,
        organizer,
        city,
        state,
        country,
        fromDate,
        toDate
    } = req.body;
    const certificatePath = req.file ? req.file.path : null;
    try {
        const query = `
            UPDATE events_attended
            SET type_of_event = ?,
                sponsoring_agency = ?,
                title = ?,
                abbreviation = ?,
                organizer = ?,
                city = ?,
                state = ?,
                country = ?,
                from_date = ?,
                to_date = ?
                ${certificatePath ? ', certificate_path = ?' : ''}
            WHERE id = ?
        `;

        const values = [
            typeOfEvent,
            sponsoringAgency,
            title,
            abbreviation,
            organizer,
            city,
            state,
            country,
            fromDate,
            toDate
        ];
        if (certificatePath) {
            values.push(certificatePath); // Add certificate path only if it exists
        }
        values.push(id); // Add the ID to the end of the values array

        await pool.query(query, values);

        res.status(200).json({ message: 'Event attended data updated successfully.' });
    } catch (err) {
        console.error('Error updating event attended data:', err);
        res.status(500).json({ error: 'Server error while updating event attended data.' });
    }
});

// PDF export (download only, no file saved)
router.get('/pdf', async (req, res) => {
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="EventAttended_Report.pdf"');
    doc.pipe(res);

    doc.fontSize(18).text('Events Attended Report', { underline: true });
    doc.moveDown();

    const { filterType, academicYear, dateFrom, dateTo } = req.query;
    const params = [];
    let sql = 'SELECT * FROM events_attended WHERE'
    if (filterType === 'date' && dateFrom && dateTo) {
        sql += ` from_date BETWEEN ? AND ? OR to_date BETWEEN ? AND ?`;
        params.push(dateFrom, dateTo);
        params.push(dateFrom, dateTo);
        console.log('dateFrom', dateFrom);
        console.log('dateTo', dateTo);
    }
    if (filterType === 'year' && academicYear) {
        // academicYear format: "2023-2024"
        const [startYear, endYear] = academicYear.split('-');
        sql += ' (YEAR(from_date) >= ? AND YEAR(from_date) <= ?)';
        params.push(startYear, endYear);
    }
    sql += ' ORDER BY from_date';
    const [rows] = await pool.query(sql, params);

    rows.forEach((entry, i) => {
        doc.font('Helvetica-Bold').text(`${i + 1}. ${entry.title}`);
        doc.font('Helvetica-Bold').text(`Type:`, { continued: true }).font('Helvetica').text(` ${entry.type_of_event}`);
        doc.font('Helvetica-Bold').text(`Agency:`, { continued: true }).font('Helvetica').text(`${entry.sponsoring_agency}`);
        doc.font('Helvetica-Bold').text(`Abbreviation:`, { continued: true }).font('Helvetica').text(` ${entry.abbreviation}`);
        doc.font('Helvetica-Bold').text(`Organizer:`, { continued: true }).font('Helvetica').text(` ${entry.organizer}`);
        doc.font('Helvetica-Bold').text(`Location:`, { continued: true }).font('Helvetica').text(` ${entry.city}, ${entry.state}, ${entry.country}`);
        doc.font('Helvetica-Bold').text(`From:`, { continued: true }).font('Helvetica').text(` ${entry.from_date}`);
        doc.font('Helvetica-Bold').text(`To:`, { continued: true }).font('Helvetica').text(` ${entry.to_date}`);
        doc.moveDown();
    });

    doc.end();
});

// XLSX export (download only, no file saved)
router.get('/xlsx', async (req, res) => {
    const { filterType, academicYear, dateFrom, dateTo } = req.query;
    const params = [];
    let sql = 'SELECT * FROM events_attended WHERE'
    sql += ` from_date BETWEEN ? AND ? OR to_date BETWEEN ? AND ?`;
    if (filterType === 'date' && dateFrom && dateTo) {
        params.push(dateFrom, dateTo);
        params.push(dateFrom, dateTo);
        console.log('dateFrom', dateFrom);
        console.log('dateTo', dateTo);
    }
    else if (filterType === 'year' && academicYear) {
      let [startYear, endYear] = academicYear.split('-');
      startYear = `${startYear}-08-01`;
      endYear = `20${endYear}-07-31`;

      params.push(startYear, endYear);
      params.push(startYear, endYear);
    }
    sql += ' ORDER BY type_of_event,from_date';
    const [grouped] = await pool.query(sql, params);
    if (!grouped || grouped.length === 0) {
        return res.status(404).send('<script>alert("No data found!"); window.history.back();</script>');
    }
    
    const rows = {};
    for (const entry of grouped) {
        if (!rows[entry.type_of_event]) rows[entry.type_of_event] = [];
        rows[entry.type_of_event].push(entry);
    }

    const workbook = new ExcelJS.Workbook();
    const header = ['S. No', 'Type of Event', 'Sponsoring Agency', 'Title', 'Abbreviation', 'Organizer', 'City', 'State', 'Country', 'From Date', 'To Date'];
    for (const type in rows) {
        const sheet = workbook.addWorksheet(type.replace(/\//g, '&'));
 
        const heading = `List of ${type} (Sorted by ${filterType === 'year' ? `Year ${academicYear}` : `Date ${dateFrom} - ${dateTo}`})`;
        const headingRow = sheet.addRow([heading]);
        headingRow.font = { bold: true, size: 20 };
        headingRow.alignment = { horizontal: 'center' };
 
        sheet.addRow([]);
        sheet.mergeCells('A1:K1');

        sheet.addRow(header);

        rows[type].forEach((row, i) => {
            sheet.addRow([
                i + 1,
                row.type_of_event || 'N/A',
                row.sponsoring_agency || 'N/A',
                row.title || 'N/A',
                row.abbreviation || 'N/A',
                row.organizer || 'N/A',
                row.city || 'N/A',
                row.state || 'N/A',
                row.country || 'N/A',
                String(row.from_date).slice(0, 15),
                String(row.to_date).slice(0, 15),
            ]);
        });

        // Styling
        sheet.getRow(3).font = { bold: true };
        sheet.eachRow(row => {
            row.eachCell(cell => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Auto column width
       sheet.columns.forEach((col, i) => {
        let maxLength = 10;
        col.eachCell({ includeEmpty: false }, cell => {
          if (cell.row <= 2) return;
          const len = String(cell.value || '').length;
          if (len > maxLength) maxLength = len;
        });
        col.width = maxLength + 2;
      });

    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="EventAttended_Report.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
});

// DOCX export (download only, no file saved)
router.get('/docx', async (req, res) => {
    const { filterType, academicYear, dateFrom, dateTo } = req.query;
    const params = [];
    let sql = 'SELECT * FROM events_attended WHERE'
    if (filterType === 'date' && dateFrom && dateTo) {
        sql += ` from_date BETWEEN ? AND ? OR to_date BETWEEN ? AND ?`;
        params.push(dateFrom, dateTo);
        params.push(dateFrom, dateTo);
        console.log('dateFrom', dateFrom);
        console.log('dateTo', dateTo);
    }
    if (filterType === 'year' && academicYear) {
        // academicYear format: "2023-2024"
        const [startYear, endYear] = academicYear.split('-');
        sql += ' (YEAR(from_date) >= ? AND YEAR(from_date) <= ?)';
        params.push(startYear, endYear);
    }
    sql += ' ORDER BY from_date';
    const [rows] = await pool.query(sql, params);

    const paragraphs = [
        new Paragraph({
            children: [
                new TextRun({
                    text: 'Events Attended Report',
                    bold: true,
                    size: 32
                })
            ],
            heading: HeadingLevel.HEADING_1
        }),
        ...rows.map((row, i) =>
            new Paragraph({
                children: [
                    new TextRun({ text: `\n${i + 1}. ${row.title || 'N/A'}`, bold: true }),
                    new TextRun({ text: `\nType: `, bold: true }),
                    new TextRun(`${row.type_of_event || 'N/A'}`),
                    new TextRun({ text: `\nAgency: `, bold: true }),
                    new TextRun(`${row.sponsoring_agency || 'N/A'}`),
                    new TextRun({ text: `\nAbbreviation: `, bold: true }),
                    new TextRun(`${row.abbreviation || 'N/A'}`),
                    new TextRun({ text: `\nOrganizer: `, bold: true }),
                    new TextRun(`${row.organizer || 'N/A'}`),
                    new TextRun({ text: `\nLocation: `, bold: true }),
                    new TextRun(`${row.city || 'N/A'}, ${row.state || 'N/A'}, ${row.country || 'N/A'}`),
                    new TextRun({ text: `\nFrom: `, bold: true }),
                    new TextRun(`${row.from_date || 'N/A'}`),
                    new TextRun({ text: `  To: `, bold: true }),
                    new TextRun(`${row.to_date || 'N/A'}`)
                ]
            })
        )
    ];

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: paragraphs
            }
        ]
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="EventAttended_Report.docx"');
    res.send(buffer);
});


module.exports = router;