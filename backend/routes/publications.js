const express = require('express');
const router = express.Router();
const db = require('../db');

const path = require('path');
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const { jsPDF } = require('jspdf');
const { autoTable } = require('jspdf-autotable');
const { saveAs } = require('file-saver');
const ExcelJS = require('exceljs');
const { start } = require('repl');

// Get all publications
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM publications');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new publication
router.post('/', async (req, res) => {
  const data = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO publications (
        type, title, year, authors, editors,
        journal_name, volume, issue, pages_from, pages_to,
        conf_name, conf_abbrev, conf_type, conf_date_from, conf_date_to,
        venue_city, venue_state, venue_country, publication_agency, conf_pages_from, conf_pages_to,
        book_title, book_publication_agency, book_pages_from, book_pages_to,
        agency_city, agency_state, agency_country
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.type, data.title, data.year, JSON.stringify(data.authors), JSON.stringify(data.editors),
        data.journal_name, data.volume, data.issue, data.pages_from, data.pages_to,
        data.conf_name, data.conf_abbrev, data.conf_type, data.conf_date_from, data.conf_date_to,
        data.venue_city, data.venue_state, data.venue_country, data.publication_agency, data.conf_pages_from, data.conf_pages_to,
        data.book_title, data.book_publication_agency, data.book_pages_from, data.book_pages_to,
        data.agency_city, data.agency_state, data.agency_country
      ]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  try {
    const [result] = await db.query(
      `UPDATE publications SET
        type = ?, title = ?, year = ?, authors = ?, editors = ?,
        journal_name = ?, volume = ?, issue = ?, pages_from = ?, pages_to = ?,
        conf_name = ?, conf_abbrev = ?, conf_type = ?, conf_date_from = ?, conf_date_to = ?,
        venue_city = ?, venue_state = ?, venue_country = ?, publication_agency = ?,
        conf_pages_from = ?, conf_pages_to = ?,
        book_title = ?, book_publication_agency = ?, book_pages_from = ?, book_pages_to = ?,
        agency_city = ?, agency_state = ?, agency_country = ?
      WHERE id = ?`,
      [
        data.type, data.title, data.year, JSON.stringify(data.authors), JSON.stringify(data.editors),
        data.journal_name, data.volume, data.issue, data.pages_from, data.pages_to,
        data.conf_name, data.conf_abbrev, data.conf_type, data.conf_date_from, data.conf_date_to,
        data.venue_city, data.venue_state, data.venue_country, data.publication_agency,
        data.conf_pages_from, data.conf_pages_to,
        data.book_title, data.book_publication_agency, data.book_pages_from, data.book_pages_to,
        data.agency_city, data.agency_state, data.agency_country,
        id
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Publication not found' });
    }
    res.json({ message: 'Publication updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



const formatCitation = (pub) => {
  const authors = pub.authors;
  switch (pub.type) {
    case 'Journal':
      return `${authors.map(a => `${a.first} ${a.middle ? a.middle : ''} ${a.last}`).join(',')}, ${pub.title}, ${pub.journal_name}, vol. ${pub.volume}, no. ${pub.issue}, pp. ${pub.pages_from} - ${pub.pages_to}, ${pub.year}.`;
    case 'Conference':
      return `${authors.map(a => `${a.first} ${a.middle ? a.middle : ''} ${a.last}`).join(',')}, ${pub.title}, Proceedings of the ${pub.conf_name} (${pub.conf_abbrev}), ${pub.venue_city}, ${pub.venue_state}, ${pub.venue_country}: ${pub.publication_agency}, ${pub.conf_date_from} – ${pub.conf_date_to}, pp. ${pub.conf_pages_from}-${pub.conf_pages_to}.`;
    case 'BookChapter':
      return `${authors.map(a => `${a.first} ${a.middle ? a.middle : ''} ${a.last}`).join(',')}, ${pub.title}, In: ${pub.editors.map(a => `${a.first} ${a.middle ? a.middle : ''} ${a.last}`).join(',')} (eds) ${pub.book_title}, ${pub.book_publication_agency}, pp. ${pub.book_pages_from}-${pub.book_pages_to}, ${pub.year}.`;
    case 'Book':
      return `${authors.map(a => `${a.first} ${a.middle ? a.middle : ''} ${a.last}`).join(',')}, ${pub.title}, ${pub.book_publication_agency}, ${pub.agency_city}, ${pub.agency_state}, ${pub.agency_country}, ${pub.year}.`;
    default:
      return `${authors.map(a => `${a.first} ${a.middle ? a.middle : ''} ${a.last}`).join(',')}, ${pub.title}, ${pub.year}`;
  }
};

// Fetch and group by type
const getPublicationsGroupedByYear = async (academicYear) => {
  let [startYear, endYear] = academicYear.split('-') || '';
  endYear = `20${endYear}`;

  console.log("Start:", startYear)
  console.log("End:", endYear)
  const [rows] = await db.execute(
    `SELECT * FROM publications WHERE 
      (
        (type = 'Conference' AND (YEAR(conf_date_from) = ? OR YEAR(conf_date_to) = ?))
        OR
        (type != 'Conference' AND (year = ? OR year = ?))
      )
      ORDER BY type`,
    [startYear, endYear, startYear, endYear]
  );
  const grouped = {};
  for (const pub of rows) {
    if (!grouped[pub.type]) grouped[pub.type] = [];
    grouped[pub.type].push(pub);
  }
  return grouped;
};

// PDF Report
router.get('/pdf', async (req, res) => {
  const params = {
    filterType: req.query.filterType,
    academicYear: req.query.academicYear || ''
  };
  console.log('params', params);
  const grouped = await getPublicationsGroupedByYear(params.academicYear);
  const doc = new jsPDF();

  let y = 10;
  doc.setFontSize(16);
  doc.text('Publications Report', 10, y);
  y += 10;
  doc.setFontSize(12);
  for (const type of Object.keys(grouped)) {
    doc.text(type, 10, y);
    y += 10;
    const rows = grouped[type].map((pub, index) => [index + 1, formatCitation(pub)]);
    autoTable(doc, {
      startY: y,
      head: [['#', 'Citation']],
      body: rows,
      theme: 'grid',
    });
    y = doc.lastAutoTable.finalY + 10;
  }
  const pdfBuffer = doc.output('arraybuffer');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="Publication_Report.pdf"');
  res.send(Buffer.from(pdfBuffer));
});

router.get('/xlsx', async (req, res) => {
  try {
    const params = {
      filterType: req.query.filterType,
      academicYear: req.query.academicYear || ''
    };
    console.log('params', params);
    const grouped = await getPublicationsGroupedByYear(params.academicYear);
    if (!grouped || grouped.length === 0) {
      return res.status(404).send('<script>alert("No data found!"); window.history.back();</script>');
    }
    const workbook = new ExcelJS.Workbook();

    for (const type in grouped) {
      // Add a heading row for the type
      // const sheet = workbook.worksheets[0] || workbook.addWorksheet('Publications');
      // Create a new worksheet for each type
      const sheet = workbook.addWorksheet(type);

      // Add heading row for the type
      const heading = `List of ${type} (Sorted by ${params.filterType || 'Year'} ${params.academicYear || ''})`;
      const headingRow = sheet.addRow([heading]);
      headingRow.font = { bold: true, size: 20 };
      headingRow.alignment = { horizontal: 'center' }
      sheet.mergeCells(`A1:B1`);
      sheet.addRow([]); // Empty row for spacing

      // Add header row
      const header = ['Sr. No.', 'Citation'];
      const headerRow = sheet.addRow(header);
      headerRow.eachCell(cell => {
        cell.font = { bold: true };
        cell.alignment = { wrapText: true }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

      });

      let maxSnoWidth = 0;
      let maxCitationWidth = 0;
      maxSnoWidth = Math.max(maxSnoWidth, header[0].toString().length);
      maxCitationWidth = Math.max(maxCitationWidth, header[1].length);

      // Add citation rows
      grouped[type].forEach((pub, index) => {
        // const row = sheet.addRow([index + 1, formatCitation(pub)]);
        const sno = index + 1;
        const citation = formatCitation(pub);

        const row = sheet.addRow([sno, citation]);
        row.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
        // Track max width for manual auto-sizing
        maxSnoWidth = Math.max(maxSnoWidth, sno.toString().length);
        maxCitationWidth = Math.max(maxCitationWidth, citation.length);
      });

      // AFTER the loop, set the column widths
      sheet.columns[0].width = maxSnoWidth + 2; // Add some padding
      sheet.columns[1].width = maxCitationWidth > 100 ? 100 : maxCitationWidth + 5; // Cap citation width if too long
    }

    const filePath = path.join(__dirname, '../Publication_Report.xlsx');
    await workbook.xlsx.writeFile(filePath);
    res.download(filePath);
  } catch (err) {
    console.error('Error generating XLSX:', err);
    res.status(500).send('Error generating XLSX report.');
  }
});


// DOCX Report 
router.get('/docx', async (req, res) => {
  try {
    const params = {
      filterType: req.query.filterType,
      academicYear: req.query.academicYear || ''
    };
    console.log('params', params);
    const grouped = await getPublicationsGroupedByYear(params.academicYear);

    const sections = [];

    for (const type in grouped) {
      // Add section heading
      sections.push(
        new Paragraph({
          text: type,
          heading: "Heading1",
          spacing: { after: 200 },
        })
      );

      // Add each citation as a numbered list item
      grouped[type].forEach((pub, index) => {
        sections.push(
          new Paragraph({
            text: `${index + 1}. ${formatCitation(pub)}`,
            spacing: { after: 100 },
          })
        );
      });

      // Add extra space after each type section
      sections.push(new Paragraph({ text: "", spacing: { after: 200 } }));
    }

    const doc = new Document({
      creator: "LUSIP Backend",
      title: "Publications Report",
      description: "Auto-generated publication report",
      sections: [
        {
          properties: {},
          children: sections,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const filePath = path.join(__dirname, "../Publication_Report.docx");
    fs.writeFileSync(filePath, buffer);

    res.download(filePath);
  } catch (err) {
    console.error("Error generating DOCX:", err);
    res.status(500).send("Failed to generate DOCX file.");
  }
});

module.exports = router;
