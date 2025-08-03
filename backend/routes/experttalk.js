const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, AlignmentType } = require('docx');
// POST /api/expert-talks

router.use(express.urlencoded({ extended: true }));

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/ExpertTalks');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

router.post(
  '/',
  upload.single('certificate'),
  async (req, res) => {
    try {
      const conn = await pool.getConnection();
      console.log(req.body.dates[0]);
      try {
        // Extract text fields
        const {
          salutation,
          firstName,
          middleName = null,
          lastName,
          typeOfTalk,
          title,
          event = null,
          organizer = null,
          city,
          state,
          country
        } = req.body;

        const dates = Array.isArray(req.body.dates) ? req.body.dates : [];
        console.log("Dates array:", dates);

        let certificatePath = null;
        if (req.file) {
          // e.g. "uploads/1623456789012-certificate.pdf"
          certificatePath = req.file ? req.file.path : null;
        }

        // 3.1) Insert into expert_talks
        const insertTalkSql = `
        INSERT INTO expert_talks
        (salutation, firstName, middleName, lastName, type_of_talk, title, event, organizer, city, state, country, certificate_path)
        VALUES (?, ?, ?, ?, ?, ? ,?, ?, ?, ?, ?, ?)
        `;
        const [talkResult] = await conn.execute(insertTalkSql, [
          salutation,
          firstName,
          middleName,
          lastName,
          typeOfTalk,
          title,
          event,
          organizer,
          city,
          state,
          country,
          certificatePath
        ]);

        const newTalkId = talkResult.insertId;

        // 3.2) Insert each date row
        console.log('Inserting dates for talk ID:', dates);
        if (dates.length > 0) {
          const insertDateSql = `
            INSERT INTO expert_talk_dates (expert_talk_id, talk_date)
            VALUES (?, ?)
            `;
          for (let d of dates) {
            // d is a string like "2025-06-10"
            await conn.execute(insertDateSql, [newTalkId, d]);
          }
        }

        await conn.commit();
        res.status(201).json({ success: true, id: newTalkId });
      } catch (err) {
        await conn.rollback().catch(() => { });
        console.error('Error in POST /api/expert-talks:', err);
        res.status(500).json({ success: false, error: err.message });
      } finally {
        conn.release();
      }
    } catch (err) {
      console.error('Database connection error:', err);
      res.status(500).json({ success: false, error: 'Database connection error' });
    }
  });

router.get('/dates/:id', async (req, res) => {
  const id = req.params.id;
  console.log('Fetching dates for talk ID:', id);
  try {
    const [dates] = await pool.query(
      `SELECT * FROM expert_talk_dates WHERE expert_talk_id = ?`,
      [id]
    );
    if (!dates.length) {
      return res.status(404).json({ success: false, error: 'Dates not found' });
    }
    res.json({ success: true, data: { dates } });
  } catch (err) {
    console.error('Error fetching dates for edit:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/:id',
  upload.single('certificate'),
  async (req, res) => {
    try {
      const conn = await pool.getConnection();
      try {
        const {
          salutation,
          firstName,
          middleName = null,
          lastName,
          typeOfTalk,
          title,
          event = null,
          organizer = null,
          city,
          state,
          country
        } = req.body;
        const id = req.params.id;
        console.log("Request body:", req.body);

        const dates = Array.isArray(req.body.dates) ? req.body.dates : [];
        let certificatePath = null;

        if (req.file) {
          certificatePath = req.file.path;
        }

        // Update expert_talks table
        const updateTalkSql = `UPDATE expert_talks SET salutation, firstName, middleName, lastName, type_of_talk = ?, title = ?, event = ?, organizer = ?, city = ?, state = ?, country = ? ${certificatePath ? ', certificate_path = ?' : ''} WHERE id = ? `;
        const params = [
          salutation,
          firstName,
          middleName,
          lastName,
          typeOfTalk,
          title,
          event,
          organizer,
          city,
          state,
          country
        ];
        if (certificatePath) params.push(certificatePath);
        params.push(id);

        await conn.execute(updateTalkSql, params);

        // Remove old dates
        await conn.execute(
          `DELETE FROM expert_talk_dates WHERE expert_talk_id = ?`,
          [id]
        );

        // Insert new dates
        if (dates.length > 0) {
          const insertDateSql = `
            INSERT INTO expert_talk_dates (expert_talk_id, talk_date)
            VALUES (?, ?)
          `;
          for (let d of dates) {
            await conn.execute(insertDateSql, [req.params.id, d]);
          }
        }

        await conn.commit();
        res.json({ success: true });
      } catch (err) {
        await conn.rollback().catch(() => { });
        console.error('Error in PUT /api/expert-talks/:id:', err);
        res.status(500).json({ success: false, error: err.message });
      } finally {
        conn.release();
      }
    } catch (err) {
      console.error('Database connection error:', err);
      res.status(500).json({ success: false, error: 'Database connection error' });
    }
  })

// const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun } = require('docx');
// const ExcelJS = require('exceljs');
// const { jsPDF } = require('jspdf');
// require('jspdf-autotable');
// const fs = require('fs');
// const path = require('path');

// // Helper to SELECT talks with filters
// async function getFilteredTalks({ filterType, academicYear, dateFrom, dateTo }) {
//   const conn = await pool.getConnection();
//   try {
//     let sql = `
//       SELECT t.*, GROUP_CONCAT(DATE_FORMAT(d.talk_date, '%Y-%m-%d') ORDER BY d.talk_date SEPARATOR ', ') AS dates
//       FROM expert_talks t
//       LEFT JOIN expert_talk_dates d ON t.id = d.expert_talk_id
//     `;
//     const params = [];
//     if (filterType === 'year') {
//       sql += ` WHERE YEAR(d.talk_date) = ?`;
//       params.push(Number(academicYear));
//     } else if (filterType === 'date') {
//       sql += ` WHERE d.talk_date BETWEEN ? AND ?`;
//       params.push(dateFrom, dateTo);
//     }
//     sql += ` GROUP BY t.id ORDER BY t.id`;
//     const [rows] = await conn.execute(sql, params);
//     return rows;
//   } finally {
//     conn.release();
//   }
// }

// // — PDF Route
// router.get('/pdf', async (req, res) => {
//   const { filterType, academicYear, dateFrom, dateTo } = req.query;
//   const talks = await getFilteredTalks({ filterType, academicYear, dateFrom, dateTo });

//   const doc = new jsPDF();
//   const columns = ['S.No', 'Name', 'Talk Type', 'Title', 'Event', 'Dates', 'City', 'Organizer'];
//   const rows = talks.map((t, i) => [
//     i + 1,
//     `${t.salutation} ${t.firstName} ${t.middleName || ''} ${t.lastName}`,
//     t.type_of_talk,
//     t.title,
//     t.event || '',
//     t.dates,
//     t.city,
//     t.organizer
//   ]);

//   doc.autoTable({
//     head: [columns],
//     body: rows,
//     styles: { fontSize: 8 },
//     headStyles: { fillColor: [220, 220, 220], fontStyle: 'bold' },
//     margin: { top: 20, left: 10, right: 10 }
//   });

//   const file = 'Expert_Talks_Report.pdf';
//   res.setHeader('Content-Type', 'application/pdf');
//   res.setHeader('Content-Disposition', `attachment; filename=${file}`);
//   return res.send(doc.output());
// });

// // — XLSX Route
// router.get('/xlsx', async (req, res) => {
//   const { filterType, academicYear, dateFrom, dateTo } = req.query;
//   const talks = await getFilteredTalks({ filterType, academicYear, dateFrom, dateTo });

//   const workbook = new ExcelJS.Workbook();
//   const sheet = workbook.addWorksheet('Expert Talks Report');

//   const columns = [
//     { header: 'S.No', key: 'sn' },
//     { header: 'Name', key: 'name' },
//     { header: 'Talk Type', key: 'talkType' },
//     { header: 'Title', key: 'title' },
//     { header: 'Event', key: 'event' },
//     { header: 'Dates', key: 'dates' },
//     { header: 'City', key: 'city' },
//     { header: 'Organizer', key: 'organizer' }
//   ];
//   sheet.columns = columns;

//   talks.forEach((t, i) => {
//     sheet.addRow({
//       sn: i + 1,
//       name: `${t.salutation} ${t.firstName} ${t.middleName || ''} ${t.lastName}`,
//       talkType: t.type_of_talk,
//       title: t.title,
//       event: t.event || '',
//       dates: t.dates,
//       city: t.city,
//       organizer: t.organizer
//     });
//   });

//   sheet.eachRow(row => {
//     row.eachCell(cell => {
//       cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }};
//       if (row.number === 1) cell.font = { bold: true };
//     });
//   });
//   sheet.columns.forEach(col => {
//     let maxLen = col.header.length;
//     col.eachCell(c => {
//       const v = c.value?.toString() || '';
//       if (v.length > maxLen) maxLen = v.length;
//     });
//     col.width = maxLen + 2;
//   });

//   const buffer = await workbook.xlsx.writeBuffer();
//   res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//   res.setHeader('Content-Disposition', 'attachment; filename=Expert_Talks_Report.xlsx');
//   return res.send(buffer);
// });

// — DOCX Route
// router.get('/docx', async (req, res) => {
//   const { filterType, academicYear, dateFrom, dateTo } = req.query;
//   const talks = await getFilteredTalks({ filterType, academicYear, dateFrom, dateTo });

//   const doc = new Document();
//   const rows = [
//     new TableRow({
//       children: ['S.No','Name','Talk Type','Title','Event','Dates','City','Organizer']
//         .map(text => new TableCell({ children: [new Paragraph({ text, bold: true }) }],
//                                      borders: { top: { style: 'single' }, bottom:{style:'single'}, left:{style:'single'}, right:{style:'single'} )}))
//   ];

//   talks.forEach((t, i) => {
//     rows.push(new TableRow({
//       children: [
//         i+1, 
//         `${t.salutation} ${t.firstName} ${t.middleName || ''} ${t.lastName}`,
//         t.type_of_talk,
//         t.title,
//         t.event || '',
//         t.dates,
//         t.city,
//         t.organizer
//       ].map(txt => new TableCell({ children: [new Paragraph(txt.toString())],
//                                    borders:{ top:{style:'single'}, bottom:{style:'single'}, left:{style:'single'}, right:{style:'single'} } }))
//     }));
//   });

//   doc.addSection({ children: [new Table({ rows })] });

//   const buffer = await Packer.toBuffer(doc);
//   res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
//   res.setHeader('Content-Disposition', 'attachment; filename=Expert_Talks_Report.docx');
//   return res.send(buffer);
// });


// Helper to fetch filtered expert talks

async function getFilteredTalks({ filterType, academicYear, dateFrom, dateTo }) {
  let sql = `SELECT 
    et.*, 
    DATE_FORMAT(etd.talk_date, '%Y-%m-%d') AS talk_date 
  FROM expert_talks et 
  LEFT JOIN expert_talk_dates etd ON et.id = etd.expert_talk_id 
  WHERE`;
  sql += ` talk_date BETWEEN ? AND ?`;

  const params = [];
  if (filterType === 'date' && dateFrom && dateTo) {
    params.push(dateFrom, dateTo);
    console.log('dateFrom', dateFrom);
    console.log('dateTo', dateTo);
  }
  else if (filterType === 'year' && academicYear) {
    // academicYear format: "2023-2024"
    let [startDate, endDate] = academicYear.split('-');
    startDate = `${startDate}-08-01`;
    endDate = `20${endDate}-07-31`;
    // sql += ' (YEAR(etd.talk_date) >= ? AND YEAR(etd.talk_date) <= ?)';
    params.push(startDate, endDate);
  }
  sql += ' ORDER BY etd.talk_date, et.id ';
  console.log("sql:", sql);
  const [rows] = await pool.query(sql, params);
  console.log(rows);
  // Group by talk id and aggregate all dates for each talk
  const talkMap = new Map();
  for (const row of rows) {
    if (!talkMap.has(row.id)) {
      talkMap.set(row.id, {
        ...row,
        dates: row.talk_date ? [row.talk_date] : []
      });
    } else {
      if (row.talk_date) {
        talkMap.get(row.id).dates.push(row.talk_date);
      }
    }
  }
  // return Array.from(talkMap.values());
  return rows;
}

// PDF route
router.get('/pdf', async (req, res) => {
  try {
    const { filterType, academicYear, dateFrom, dateTo } = req.query;
    const talks = await getFilteredTalks({ filterType, academicYear, dateFrom, dateTo });

    if (!talks || talks.length === 0) {
      return res.status(404).send('<script>alert("No data found!"); window.history.back();</script>');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="expert_talks.pdf"');
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    doc.pipe(res);

    // Table headings
    const headers = [
      'S.No  ', 'Salutation  ', 'First Name  ', 'Middle Name  ', 'Last Name  ', 'Type of Talk  ', 'Title  ',
      'Event  ', 'Organizer  ', 'City  ', 'State  ', 'Country  ', 'Date  '
    ];
    doc.font('Helvetica-Bold').fontSize(12);
    headers.forEach((h, i) => {
      doc.text(h, { continued: i < headers.length - 1, underline: true });
    });
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(10);
    talks.forEach((talk, idx) => {
      const row = [
        `${idx + 1}.  `,
        `${talk.salutation}  `,
        `${talk.firstName}  `,
        `${talk.middleName}  ` || '',
        `${talk.lastName}  `,
        `${talk.type_of_talk}  `,
        `${talk.title}  `,
        `${talk.event}  ` || '',
        `${talk.organizer}  ` || '',
        `${talk.city}  `,
        `${talk.state}  `,
        `${talk.country}  `,
        `${talk.talk_date}  `
      ];
      row.forEach((cell, i) => {
        doc.text(cell, { continued: i < row.length - 1 });
      });
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Excel route
router.get('/xlsx', async (req, res) => {
  try {
    const { filterType, academicYear, dateFrom, dateTo } = req.query;
    const talks = await getFilteredTalks({ filterType, academicYear, dateFrom, dateTo });

    if (!talks || talks.length === 0) {
      return res.status(404).send('<script>alert("No data found!"); window.history.back();</script>');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Expert Talks');
    const heading = `List of Faculties (Sorted by ${filterType === 'year' ? `Year ${academicYear}` : `Date ${dateFrom} - ${dateTo}`})`;
    const headingRow = worksheet.addRow([heading]);
    headingRow.font = { bold: true, size: 20 };
    headingRow.alignment = { horizontal: 'center' }
    worksheet.mergeCells(`A1:M1`);
    worksheet.addRow([]);


    const headers = [
      'S.No', 'Salutation', 'First Name', 'Middle Name', 'Last Name', 'Type of Talk', 'Title',
      'Event', 'Organizer', 'City', 'State', 'Country', 'Dates'
    ];
    worksheet.addRow(headers);

    // Add data rows
    talks.forEach((talk, idx) => {
      worksheet.addRow([
        idx + 1,
        talk.salutation,
        talk.firstName,
        talk.middleName || 'N/A',
        talk.lastName,
        talk.type_of_talk,
        talk.title,
        talk.event || '',
        talk.organizer || '',
        talk.city,
        talk.state,
        talk.country,
        // new Date(talk.talk_date).toISOString().slice(0, 10)
        talk.talk_date//.join(', '),
      ]);
    });

    // Style: bold headings, all borders, auto column width
    worksheet.getRow(3).font = { bold: true };
    worksheet.eachRow({ includeEmpty: false }, row => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
    // Auto width
    worksheet.columns.forEach((col, i) => {
      let maxLength = 10;
      col.eachCell({ includeEmpty: false }, cell => {
        if(cell.row<=2) return;
        const len = String(cell.value || '').length;
        if (len > maxLength) maxLength = len;
      });
      col.width = maxLength + 2;
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="expert_talks.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DOCX route
router.get('/docx', async (req, res) => {
  try {
    const { filterType, academicYear, dateFrom, dateTo } = req.query;
    const talks = await getFilteredTalks({ filterType, academicYear, dateFrom, dateTo });

    if (!talks || talks.length === 0) {
      return res.status(404).send('<script>alert("No data found!"); window.history.back();</script>');
    }
    console.log(talks)
    const headers = [
      'S.No', 'Salutation', 'First Name', 'Middle Name', 'Last Name', 'Type of Talk', 'Title',
      'Event', 'Organizer', 'City', 'State', 'Country', 'Dates'
    ]

    const tableRows = [
      new TableRow({
        children: headers.map(h =>
          new TableCell({
            children: [new Paragraph({ text: h, bold: true })],
            verticalAlign: 'center'
          })
        )
      }),
      ...talks.map((talk, idx) =>
        new TableRow({
          children: [
            idx + 1,
            talk.salutation,
            talk.firstName,
            talk.middleName || '',
            talk.lastName,
            talk.type_of_talk,
            talk.title,
            talk.event || '',
            talk.organizer || '',
            talk.city,
            talk.state,
            talk.country,
            talk.talk_date
          ].map(val =>
            new TableCell({
              children: [new Paragraph(String(val))],
              verticalAlign: 'center'
            })
          )
        })
      )
    ];

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: 'Expert Talks',
              heading: 'Heading1',
              alignment: AlignmentType.CENTER
            }),
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE }
            })
          ]
        }
      ]
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="expert_talks.docx"');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;