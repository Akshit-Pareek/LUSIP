const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db'); // Your DB connection
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
const { start } = require('repl');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/Faculty');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Handle file uploads from multiple sections
const uploadFields = upload.fields([
    { name: 'awardCertificate' },
    { name: 'paperCertificate' },
    { name: 'outreachCertificate' }
]);

router.post('/', uploadFields, async (req, res) => {
    try {
        const data = req.body;
        const files = req.files;
        console.log('Received data:', data);
        const {
            awardDate, year, guided_year,
            section,
            firstName, middleName, lastName,
            department, designation,

            // Awards
            awardDetail, awardingAgency, photoLink,

            // Guided
            programme, mainSupervisorCount, coSupervisorCount,

            // Course
            courseName, courseCode, courseLevel,

            // Paper
            paperTitle, eventMode, sponsoringAgency, eventTitle, eventAbbreviation,
            fundedByInstitute, amountFunded, organizer,
            venueCity, venueState, venueCountry,
            fromDate, toDate, achievement,

            // Outreach
            outreachCategory, outreachEventName, outreachAbbreviation,
            outreachAgency, outreachVenueCity, outreachVenueState,
            outreachVenueCountry, outreachFrom, outreachTo
        } = data;

        const awardCertificate = files?.awardCertificate?.[0]?.path || null;
        const paperCertificate = files?.paperCertificate?.[0]?.path || null;
        const outreachCertificate = files?.outreachCertificate?.[0]?.path || null;

        const query = `
      INSERT INTO faculty_contributions (
        awardDate, year, guided_year,
        section, first_name, middle_name, last_name, department, designation,
        award_detail, awarding_agency, award_certificate, photo_link,
        programme, main_supervisor_count, co_supervisor_count,
        course_name, course_code, course_level,
        paper_title, event_mode, sponsoring_agency, event_title, event_abbreviation,
        funded_by_institute, amount_funded, organizer,
        venue_city, venue_state, venue_country,
        from_date, to_date, achievement, paper_certificate,
        outreach_category, outreach_event_name, outreach_abbreviation, outreach_agency,
        outreach_venue_city, outreach_venue_state, outreach_venue_country,
        outreach_from, outreach_to, outreach_certificate
      ) VALUES (?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?)
    `;

        const values = [
            awardDate, year, guided_year,
            section, firstName, middleName, lastName, department, designation,
            awardDetail, awardingAgency, awardCertificate, photoLink,
            programme, mainSupervisorCount, coSupervisorCount,
            courseName, courseCode, courseLevel,
            paperTitle, eventMode, sponsoringAgency, eventTitle, eventAbbreviation,
            fundedByInstitute, amountFunded, organizer,
            venueCity, venueState, venueCountry,
            fromDate, toDate, achievement, paperCertificate,
            outreachCategory, outreachEventName, outreachAbbreviation, outreachAgency,
            outreachVenueCity, outreachVenueState, outreachVenueCountry,
            outreachFrom, outreachTo, outreachCertificate
        ];

        await db.query(query, values);
        res.status(200).json({ message: 'Faculty contribution submitted successfully' });

    } catch (error) {
        console.error('Error submitting faculty contribution:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/:id', uploadFields, async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const files = req.files;

        const {
            awardDate, year, guided_year,
            section,
            firstName, middleName, lastName,
            department, designation,
            awardDetail, awardingAgency, photoLink,
            programme, mainSupervisorCount, coSupervisorCount,
            courseName, courseCode, courseLevel,
            paperTitle, eventMode, sponsoringAgency, eventTitle, eventAbbreviation,
            fundedByInstitute, amountFunded, organizer,
            venueCity, venueState, venueCountry,
            fromDate, toDate, achievement,
            outreachCategory, outreachEventName, outreachAbbreviation, outreachAgency,
            outreachVenueCity, outreachVenueState, outreachVenueCountry,
            outreachFrom, outreachTo
        } = data;

        // Fetch existing file paths
        const [rows] = await db.query('SELECT award_certificate, paper_certificate, outreach_certificate FROM faculty_contributions WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Faculty record not found.' });
        }

        // Determine new or existing file paths
        let awardCertificate = rows[0].award_certificate;
        let paperCertificate = rows[0].paper_certificate;
        let outreachCertificate = rows[0].outreach_certificate;

        if (files?.awardCertificate?.[0]) {
            if (awardCertificate && fs.existsSync(awardCertificate)) {
                fs.unlinkSync(awardCertificate);
            }
            awardCertificate = files.awardCertificate[0].path;
        }
        if (files?.paperCertificate?.[0]) {
            if (paperCertificate && fs.existsSync(paperCertificate)) {
                fs.unlinkSync(paperCertificate);
            }
            paperCertificate = files.paperCertificate[0].path;
        }
        if (files?.outreachCertificate?.[0]) {
            if (outreachCertificate && fs.existsSync(outreachCertificate)) {
                fs.unlinkSync(outreachCertificate);
            }
            outreachCertificate = files.outreachCertificate[0].path;
        }

        const query = `
            UPDATE faculty_contributions SET
                awardDate = ?, year = ?, guided_year = ?,
                section = ?, first_name = ?, middle_name = ?, last_name = ?, department = ?, designation = ?,
                award_detail = ?, awarding_agency = ?, award_certificate = COALESCE(?, award_certificate), photo_link = ?,
                programme = ?, main_supervisor_count = ?, co_supervisor_count = ?,
                course_name = ?, course_code = ?, course_level = ?,
                paper_title = ?, event_mode = ?, sponsoring_agency = ?, event_title = ?, event_abbreviation = ?,
                funded_by_institute = ?, amount_funded = ?, organizer = ?,
                venue_city = ?, venue_state = ?, venue_country = ?,
                from_date = ?, to_date = ?, achievement = ?, paper_certificate = COALESCE(?, paper_certificate),
                outreach_category = ?, outreach_event_name = ?, outreach_abbreviation = ?, outreach_agency = ?,
                outreach_venue_city = ?, outreach_venue_state = ?, outreach_venue_country = ?,
                outreach_from = ?, outreach_to = ?, outreach_certificate = COALESCE(?, outreach_certificate)
            WHERE id = ?
        `;

        const values = [
            awardDate, year, guided_year,
            section, firstName, middleName, lastName, department, designation,
            awardDetail, awardingAgency, awardCertificate, photoLink,
            programme, mainSupervisorCount, coSupervisorCount,
            courseName, courseCode, courseLevel,
            paperTitle, eventMode, sponsoringAgency, eventTitle, eventAbbreviation,
            fundedByInstitute, amountFunded, organizer,
            venueCity, venueState, venueCountry,
            fromDate, toDate, achievement, paperCertificate,
            outreachCategory, outreachEventName, outreachAbbreviation, outreachAgency,
            outreachVenueCity, outreachVenueState, outreachVenueCountry,
            outreachFrom, outreachTo, outreachCertificate,
            id
        ];

        await db.query(query, values);
        res.status(200).json({ message: 'Faculty contribution updated successfully' });
    } catch (error) {
        console.error('Error updating faculty contribution:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/pdf', async (req, res) => {
    try {
        const { filterType, academicYear, dateFrom, dateTo } = req.query;
        const params = [];
        let sql = 'SELECT * FROM faculty_contributions';
        let whereClauses = [];

        let dateFieldStart, dateFieldEnd;
        switch (FacTab) {
            case 'awards':
                dateFieldStart = 'awardDate';
                break;
            case 'guided':
                dateFieldStart = 'guided_year';
                break;
            case 'course':
                dateFieldStart = 'year';
                break;
            case 'paper':
                dateFieldStart = 'from_date';
                dateFieldEnd = 'to_date';
                break;
            case 'outreach':
                dateFieldStart = 'outreach_from';
                dateFieldEnd = 'outreach_to';
                break;
            default:
                dateFieldStart = null;
        }

        let orderBy = ' ORDER BY section, ';
        orderBy += dateFieldStart;

        // Filter by section/tab
        if (FacTab) {
            whereClauses.push('section = ?');
            params.push(FacTab);
        }

        // Filter by date or year
        if (filterType === 'date' && dateFrom && dateTo && dateFieldStart) {
            if (dateFieldEnd) {
                whereClauses.push(`(${dateFieldStart} BETWEEN ? AND ? OR ${dateFieldEnd} BETWEEN ? AND ?)`);
                params.push(dateFrom, dateTo, dateFrom, dateTo);
            } else {
                whereClauses.push(`${dateFieldStart} BETWEEN ? AND ?`);
                params.push(dateFrom, dateTo);
            }
        }
        if (filterType === 'year' && academicYear && dateFieldStart) {
            // academicYear format: "2023-2024"
            if (FacTab !== 'guided' && FacTab !== 'course') {
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

        const [rows] = await db.query(sql, params);
        if (!rows || rows.length === 0) {
            return res.status(404).send('<script>alert("No data found!"); window.history.back();</script>');
        }
        const doc = new PDFDocument({ autoFirstPage: false });

        // Set response headers for download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="FacultyContributions_Report.pdf"');
        doc.pipe(res);

        let currentSection = '';
        rows.forEach((row, idx) => {
            if (row.section !== currentSection) {
                currentSection = row.section;
                doc.addPage().fontSize(18).text(currentSection, { underline: true });
                doc.moveDown();
            }
            doc.font('Helvetica').fontSize(10);
            // Write all fields
            doc.font('Helvetica-Bold').text(`${idx + 1}.`);
            doc.fontSize(12).font('Helvetica-Bold').text(
                `${row.first_name} ${row.middle_name || ''} ${row.last_name} — ${row.designation}, ${row.department}`
            );
            if (row.section === 'awards') {
                doc.font('Helvetica-Bold').text(`Award Detail:`, { continued: true }).font('Helvetica').text(` ${row.award_detail}`);
                doc.font('Helvetica-Bold').text(`Award Agency:`, { continued: true }).font('Helvetica').text(` ${row.awarding_agency}`);
                doc.font('Helvetica-Bold').text(`Photo Link:`, { continued: true }).font('Helvetica').text(` ${row.photo_link}`);
                doc.font('Helvetica-Bold').text(`Award Date:`, { continued: true }).font('Helvetica').text(` ${row.awardDate}`);
            }
            else if (row.section === 'guided') {
                doc.font('Helvetica-Bold').text(`Programme:`, { continued: true }).font('Helvetica').text(` ${row.programme}`);
                doc.font('Helvetica-Bold').text(`No. of Main Supervisors:`, { continued: true }).font('Helvetica').text(` ${row.main_supervisor_count}`);
                doc.font('Helvetica-Bold').text(`No. of Co-Supervisors:`, { continued: true }).font('Helvetica').text(` ${row.co_supervisor_count}`);
                doc.font('Helvetica-Bold').text(`Year:`, { continued: true }).font('Helvetica').text(` ${row.guided_year}`);
            }
            else if (row.section === 'course') {
                doc.font('Helvetica-Bold').text(`Course Name:`, { continued: true }).font('Helvetica').text(` ${row.course_name}`);
                doc.font('Helvetica-Bold').text(`Course Code:`, { continued: true }).font('Helvetica').text(` ${row.course_code}`);
                doc.font('Helvetica-Bold').text(`Level:`, { continued: true }).font('Helvetica').text(` ${row.course_level}`);
                doc.font('Helvetica-Bold').text(`Year:`, { continued: true }).font('Helvetica').text(` ${row.year}`);
            }
            else if (row.section === 'paper') {
                doc.font('Helvetica-Bold').text(`Paper Title:`, { continued: true }).font('Helvetica').text(` ${row.paper_title}`);
                doc.font('Helvetica-Bold').text(`Mode:`, { continued: true }).font('Helvetica').text(` ${row.event_mode}`);
                doc.font('Helvetica-Bold').text(`Sponsoring Agency:`, { continued: true }).font('Helvetica').text(` ${row.sponsoring_agency}`);
                doc.font('Helvetica-Bold').text(`Event Title:`, { continued: true }).font('Helvetica').text(`${row.event_title}(${row.event_abbreviation})`);
                if (row.funded_by_institute === 'Yes') doc.font('Helvetica-Bold').text(`Funded By Institute:`, { continued: true }).font('Helvetica').text(` ${row.funded_by_institute}`).font('Helvetica-Bold').text(`Amount:`).font('Helvetica').text(`${row.amount_funded}`);
                else doc.font('Helvetica-Bold').text(`Funded By Institute:`, { continued: true }).font('Helvetica').text(` ${row.funded_by_institute}`);
                doc.font('Helvetica-Bold').text(`Organizer:`, { continued: true }).font('Helvetica').text(` ${row.organizer}`);
                doc.font('Helvetica-Bold').text(`Venue:`, { continued: true }).font('Helvetica').text(` ${row.venue_city}, ${row.venue_state}, ${row.venue_country} `);
                doc.font('Helvetica-Bold').text(`Date:`, { continued: true }).font('Helvetica').text(` ${row.from_date} - ${row.to_date}`);
                doc.font('Helvetica-Bold').text(`Achievements:`, { continued: true }).font('Helvetica').text(` ${row.achievement}`);
            }
            else if (row.section === 'outreach') {
                doc.font('Helvetica-Bold').text(`Category:`, { continued: true }).font('Helvetica').text(` ${row.outreach_category}`);
                doc.font('Helvetica-Bold').text(`Event Name:`, { continued: true }).font('Helvetica').text(` ${row.outreach_event_name}(${row.outreach_abbreviation})`);
                doc.font('Helvetica-Bold').text(`Agency:`, { continued: true }).font('Helvetica').text(` ${row.outreach_venue_city}, ${row.outreach_venue_state},${row.outreach_venue_country}`);
                doc.font('Helvetica-Bold').text(`Date:`, { continued: true }).font('Helvetica').text(` ${row.outreach_from} - ${row.outreach_to}`);
            }
            doc.moveDown();
        });
        doc.end();
    } catch (err) {
        console.error(err);
        res.status(500).send('PDF generation failed');
    }
});

router.get('/xlsx', async (req, res) => {
    try {
        const { filterType, academicYear, dateFrom, dateTo } = req.query;
        const params = [];
        let sql = 'SELECT * FROM faculty_contributions';
        let whereClauses = [];
        
        // For date-based filtering
        if (filterType === 'date' && dateFrom && dateTo) {
            const dateF=new Date(dateFrom);
            const dateT=new Date(dateTo);
            let start = `${dateF.getFullYear}-${String(dateT.getFullYear).slice(2,4)}`;
            whereClauses.push(`(
    (awardDate BETWEEN ? AND ?) OR
    (guided_year = ?) OR
    (year = ?) OR
    (from_date BETWEEN ? AND ? OR to_date BETWEEN ? AND ?) OR
    (outreach_from BETWEEN ? AND ? OR outreach_to BETWEEN ? AND ?)
  )`);
            params.push(
                dateFrom, dateTo,           // awardDate
                start,           // guided_year
                start,           // year
                dateFrom, dateTo, dateFrom, dateTo, // from_date & to_date
                dateFrom, dateTo, dateFrom, dateTo  // outreach_from & outreach_to
            );
        }

        // For academic year-based filtering
        if (filterType === 'year' && academicYear) {
            let [startYear, endYear] = academicYear.split('-');
            let start = `${startYear}-08-01`;
            let end = `20${endYear}-07-31`;

            whereClauses.push(`(
    (awardDate BETWEEN ? AND ?) OR
    (guided_year = ?) OR
    (year = ?) OR
    (from_date BETWEEN ? AND ? OR to_date BETWEEN ? AND ?) OR
    (outreach_from BETWEEN ? AND ? OR outreach_to BETWEEN ? AND ?)
  )`);
            params.push(
                start, end,           // awardDate
                academicYear,         // guided_year
                academicYear,         // year
                start, end, start, end, // from_date & to_date
                start, end, start, end  // outreach_from & outreach_to
            );
        }

        if (whereClauses.length > 0) {
            sql += ' WHERE ' + whereClauses.join(' AND ');
        }

        sql += ' ORDER BY section, awardDate, from_date, outreach_from';
        // console.log("sql:",sql)
        const [rows] = await db.query(sql, params);
        if (!rows || rows.length === 0) {
            return res.status(404).send('<script>alert("No data found!"); window.history.back();</script>');
        }

        const workbook = new ExcelJS.Workbook();

        // Dynamically set columns from DB fields
        // Define columns for each section
        const sectionColumns = {
            awards: [
                { header: 'S. No.', key: 'sno' },
                { header: 'Name', key: 'name' },
                { header: 'Department', key: 'department' },
                { header: 'Designation', key: 'designation' },
                { header: 'Award Detail', key: 'award_detail' },
                { header: 'Award Agency', key: 'awarding_agency' },
                { header: 'Photo Link', key: 'photo_link' },
                { header: 'Award Date', key: 'awardDate' }
            ],
            guided: [
                { header: 'S. No.', key: 'sno' },
                { header: 'Name', key: 'name' },
                { header: 'Department', key: 'department' },
                { header: 'Designation', key: 'designation' },
                { header: 'Programme', key: 'programme' },
                { header: 'No. of Main Supervisors', key: 'main_supervisor_count' },
                { header: 'No. of Co-Supervisors', key: 'co_supervisor_count' },
                { header: 'Guided Year', key: 'guided_year' }
            ],
            course: [
                { header: 'S. No.', key: 'sno' },
                { header: 'Name', key: 'name' },
                { header: 'Department', key: 'department' },
                { header: 'Designation', key: 'designation' },
                { header: 'Course Name', key: 'course_name' },
                { header: 'Course Code', key: 'course_code' },
                { header: 'Course Level', key: 'course_level' },
                { header: 'Year', key: 'year' }
            ],
            paper: [
                { header: 'S. No.', key: 'sno' },
                { header: 'Name', key: 'name' },
                { header: 'Department', key: 'department' },
                { header: 'Designation', key: 'designation' },
                { header: 'Paper Title', key: 'paper_title' },
                { header: 'Mode', key: 'event_mode' },
                { header: 'Sponsoring Agency', key: 'sponsoring_agency' },
                { header: 'Event Title', key: 'event_title' },
                { header: 'Event Abbreviation', key: 'event_abbreviation' },
                { header: 'Funded By Institute', key: 'funded_by_institute' },
                { header: 'Amount Funded', key: 'amount_funded' },
                { header: 'Organizer', key: 'organizer' },
                { header: 'Venue City', key: 'venue_city' },
                { header: 'Venue State', key: 'venue_state' },
                { header: 'Venue Country', key: 'venue_country' },
                { header: 'From Date', key: 'from_date' },
                { header: 'To Date', key: 'to_date' },
                { header: 'Achievements', key: 'achievement' }
            ],
            outreach: [
                { header: 'S. No.', key: 'sno' },
                { header: 'Name', key: 'name' },
                { header: 'Department', key: 'department' },
                { header: 'Designation', key: 'designation' },
                { header: 'Category', key: 'outreach_category' },
                { header: 'Event Name', key: 'outreach_event_name' },
                { header: 'Abbreviation', key: 'outreach_abbreviation' },
                { header: 'Agency', key: 'outreach_agency' },
                { header: 'Venue City', key: 'outreach_venue_city' },
                { header: 'Venue State', key: 'outreach_venue_state' },
                { header: 'Venue Country', key: 'outreach_venue_country' },
                { header: 'From', key: 'outreach_from' },
                { header: 'To', key: 'outreach_to' }
            ]
        };

        // Group rows by section
        const grouped = rows.reduce((acc, r) => {
            if (!acc[r.section]) acc[r.section] = [];
            acc[r.section].push(r);
            return acc;
        }, {});

        let sheet;
        for (const section of Object.keys(sectionColumns)) {
            let startRow = 1;
            let sectionAbb;
            if(section==='awards') sectionAbb='Awards/Recognition/Fellowship';
            else if(section==='guided') sectionAbb='PhD/M.Tech./M.S./M.Sc. Guided';
            else if(section==='course') sectionAbb='New Course Developed';
            else if(section==='paper') sectionAbb='Paper Presentation';
            else if(section==='outreach') sectionAbb='Outreach';

            sheet = workbook.addWorksheet(sectionAbb.replace(/\//g, '&'));
            // sheet = workbook.addWorksheet(section);
            const sectionRows = grouped[section] || [];
            if (sectionRows.length === 0) continue;

            // Set headers for columns (needed for width calculation)
            // if (startRow === 3) {
            // Only set once, as columns are shared across the worksheet
            // console.log('value', sheet.getCell(`A1`).value);
            // }
            // console.log("Cell1:",sheet.getCell('A1').value);
            // startRow++;
            sheet.columns = sectionColumns[section].map(col => ({ header: col.header, key: col.key }));

            // Section title row
            sheet.mergeCells(`A${startRow}:${String.fromCharCode(64 + sectionColumns[section].length)}${startRow}`);
            sheet.getCell(`A${startRow}`).value = `List of ${section.charAt(0).toUpperCase() + section.slice(1)}(Sorted by ${filterType === 'year' ? `Year ${academicYear})` : `Date ${dateFrom}-${dateTo})`}`;
            // console.log('value', sheet.getCell(`A${startRow}`).value);

            sheet.getCell(`A${startRow}`).font = { bold: true, size: 20 };
            sheet.getCell(`A${startRow}`).alignment = { horizontal: 'center' };
            startRow++;

            // sheet.addRow([' ']);
            startRow++;

            // Header row
            sectionColumns[section].forEach((col, idx) => {
                sheet.getCell(startRow, idx + 1).value = col.header;
                sheet.getCell(startRow, idx + 1).font = { bold: true };
            });
            // console.log("Row3:", sheet.getRow(3).value);


            // Data rows
            sectionRows.forEach((r, idx) => {
                const rowData = {};
                rowData.sno = `${idx + 1}`;
                rowData.name = `${r.first_name} ${r.middle_name || ''} ${r.last_name}`.trim() || 'N/A';
                rowData.designation = r.designation ? r.designation : 'N/A';
                rowData.department = r.department ? r.department : 'N/A';
                // Add all possible keys for this section
                sectionColumns[section].forEach(col => {
                    if (['awardDate', 'from_date', 'to_date', 'outreach_from', 'outreach_to'].includes(col.key)) {
                        rowData[col.key] = r[col.key] ? String(r[col.key]).slice(0, 15) : 'N/A';
                    }
                    else if (!['sno', 'name', 'designation', 'department'].includes(col.key)) {
                        rowData[col.key] = r[col.key] ? r[col.key] : 'N/A';
                    }
                });
                // Ensure values are in the correct order for the columns
                const rowValues = sectionColumns[section].map(col => rowData[col.key]);
                sheet.addRow(rowValues);
                // console.log("Row:", rowValues);
                startRow++;
            });

            // Add an empty row after each section
            // startRow++;

            // Set bold font for the first row (section title)
            sheet.eachRow(row =>
                row.eachCell(cell => {
                    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                })
            );

            // Set column widths based on max length of content in each column
            sheet.columns.forEach(col => {
                if (!col || !col.header) return;
                let max = col.header.length;
                col.eachCell({ includeEmpty: true }, c => {
                    if (c.row <= 2) return;
                    const v = c.value?.toString() || '';
                    max = Math.max(max, v.length);
                });
                col.width = max + 2;
            });
        }


        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="FacultyContributions_Report.xlsx"');
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error(err);
        res.status(500).send('XLSX generation failed');
    }
});

router.get('/docx', async (req, res) => {
    try {
        const { FacTab, filterType, academicYear, dateFrom, dateTo } = req.query;
        const params = [];
        let sql = 'SELECT * FROM faculty_contributions';
        let whereClauses = [];

        let dateFieldStart, dateFieldEnd;
        switch (FacTab) {
            case 'awards':
                dateFieldStart = 'awardDate';
                break;
            case 'guided':
                dateFieldStart = 'guided_year';
                break;
            case 'course':
                dateFieldStart = 'year';
                break;
            case 'paper':
                dateFieldStart = 'from_date';
                dateFieldEnd = 'to_date';
                break;
            case 'outreach':
                dateFieldStart = 'outreach_from';
                dateFieldEnd = 'outreach_to';
                break;
            default:
                dateFieldStart = null;
        }

        let orderBy = ' ORDER BY section, ';
        orderBy += dateFieldStart;

        // Filter by section/tab
        if (FacTab) {
            whereClauses.push('section = ?');
            params.push(FacTab);
        }

        // Filter by date or year
        if (filterType === 'date' && dateFrom && dateTo && dateFieldStart) {
            if (dateFieldEnd) {
                whereClauses.push(`(${dateFieldStart} BETWEEN ? AND ? OR ${dateFieldEnd} BETWEEN ? AND ?)`);
                params.push(dateFrom, dateTo, dateFrom, dateTo);
            } else {
                whereClauses.push(`${dateFieldStart} BETWEEN ? AND ?`);
                params.push(dateFrom, dateTo);
            }
        }
        if (filterType === 'year' && academicYear && dateFieldStart) {
            // academicYear format: "2023-2024"
            if (FacTab !== 'guided' && FacTab !== 'course') {
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
        console.log("sql:", sql);
        const [rows] = await db.query(sql, params);
        // if (!rows || rows.length === 0) {
        //     return res.status(404).send('<script>alert("No data found!"); window.history.back();</script>');
        // }

        let currentSection = '';
        const content = [];
        let idx = 0;
        for (const row of rows) {
            if (row.section !== currentSection) {
                currentSection = row.section;
                content.push(new Paragraph({
                    text: currentSection.charAt(0).toUpperCase() + currentSection.slice(1),
                    heading: HeadingLevel.HEADING1
                }));
            }

            idx++;
            // Numbered entry
            content.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: `${idx}. `, bold: true }),
                        new TextRun({ text: `${row.first_name} ${row.middle_name || ''} ${row.last_name}`, bold: true }),
                        new TextRun(` — ${row.designation}, ${row.department}`)
                    ]
                }));

            if (row.section === 'awards') {
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Award Detail: ', bold: true }),
                        new TextRun(row.award_detail ? row.award_detail : 'N/A')
                    ]
                }));
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Award Agency: ', bold: true }),
                        new TextRun(row.awarding_agency ? row.awarding_agency : 'N/A')
                    ]
                }));
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Photo Link: ', bold: true }),
                        new TextRun(row.photo_link ? row.photo_link : 'N/A')
                    ]
                }));
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Award Date: ', bold: true }),
                        new TextRun(row.awardDate ? String(row.awardDate).slice(0, 15) : 'N/A')
                    ]
                }));
            }
            else if (row.section === 'guided') {
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Programme: ', bold: true }),
                        new TextRun(row.programme ? row.programme : 'N/A')
                    ]
                }));
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'No. of Main Supervisors: ', bold: true }),
                        new TextRun(row.main_supervisor_count !== undefined && row.main_supervisor_count !== null ? String(row.main_supervisor_count) : 'N/A')
                    ]
                }));
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'No. of Co-Supervisors: ', bold: true }),
                        new TextRun(row.co_supervisor_count !== undefined && row.co_supervisor_count !== null ? String(row.co_supervisor_count) : 'N/A')
                    ]
                }));
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Year: ', bold: true }),
                        new TextRun(row.guided_year ? row.guided_year : 'N/A')
                    ]
                }));
            }
            else if (row.section === 'course') {
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Course Name: ', bold: true }),
                        new TextRun(row.course_name ? row.course_name : 'N/A')
                    ]
                }));
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Course Code: ', bold: true }),
                        new TextRun(row.course_code ? row.course_code : 'N/A')
                    ]
                }));
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Level: ', bold: true }),
                        new TextRun(row.course_level ? row.course_level : 'N/A')
                    ]
                }));
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Year: ', bold: true }),
                        new TextRun(row.year ? row.year : 'N/A')
                    ]
                }));
            }
            else if (row.section === 'paper') {
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Paper Title: ', bold: true }),
                        new TextRun(row.paper_title ? row.paper_title : 'N/A')
                    ]
                }));
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Mode: ', bold: true }),
                        new TextRun(row.event_mode ? row.event_mode : 'N/A')
                    ]
                }));
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Sponsoring Agency: ', bold: true }),
                        new TextRun(row.sponsoring_agency ? row.sponsoring_agency : 'N/A')
                    ]
                }));
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Event Title: ', bold: true }),
                        new TextRun(`${row.event_title ? row.event_title : 'N/A'} (${row.event_abbreviation ? row.event_abbreviation : 'N/A'})`)
                    ]
                }));
                if (row.funded_by_institute === 'Yes') {
                    content.push(new Paragraph({
                        children: [
                            new TextRun({ text: 'Funded By Institute: ', bold: true }),
                            new TextRun(row.funded_by_institute ? row.funded_by_institute : 'N/A'),
                            new TextRun({ text: ' Amount: ', bold: true }),
                            new TextRun(row.amount_funded !== undefined && row.amount_funded !== null ? String(row.amount_funded) : 'N/A')
                        ]
                    }));
                } else {
                    content.push(new Paragraph({
                        children: [
                            new TextRun({ text: 'Funded By Institute: ', bold: true }),
                            new TextRun(row.funded_by_institute ? row.funded_by_institute : 'N/A')
                        ]
                    }));
                }
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Organizer: ', bold: true }),
                        new TextRun(row.organizer ? row.organizer : 'N/A')
                    ]
                }));
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Venue: ', bold: true }),
                        new TextRun(`${row.venue_city ? row.venue_city : 'N/A'}, ${row.venue_state ? row.venue_state : 'N/A'}, ${row.venue_country ? row.venue_country : 'N/A'}`)
                    ]
                }));
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Date: ', bold: true }),
                        new TextRun(`${row.from_date ? String(row.from_date).slice(0, 15) : 'N/A'} - ${row.to_date ? String(row.to_date).slice(0, 15) : 'N/A'}`)
                    ]
                }));
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Achievements: ', bold: true }),
                        new TextRun(row.achievement ? row.achievement : 'N/A')
                    ]
                }));
            }
            else if (row.section === 'outreach') {
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Category: ', bold: true }),
                        new TextRun(row.outreach_category ? row.outreach_category : 'N/A')
                    ]
                }));
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Event Name: ', bold: true }),
                        new TextRun(`${row.outreach_event_name ? row.outreach_event_name : 'N/A'} (${row.outreach_abbreviation ? row.outreach_abbreviation : 'N/A'})`)
                    ]
                }));
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Agency: ', bold: true }),
                        new TextRun(row.outreach_agency ? row.outreach_agency : 'N/A')
                    ]
                }));
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Venue: ', bold: true }),
                        new TextRun(`${row.outreach_venue_city ? row.outreach_venue_city : 'N/A'}, ${row.outreach_venue_state ? row.outreach_venue_state : 'N/A'}, ${row.outreach_venue_country ? row.outreach_venue_country : 'N/A'}`)
                    ]
                }));
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Date: ', bold: true }),
                        new TextRun(`${row.outreach_from ? String(row.outreach_from).slice(0, 15) : 'N/A'} - ${row.outreach_to ? String(row.outreach_to).slice(0, 15) : 'N/A'}`)
                    ]
                }));
                // console.log(`Date: ${row.outreach_from ? String(row.outreach_from).slice(0,15) : 'N/A'}`)
            }
            // console.log("Row:", row);
            content.push(new Paragraph(''));
        }

        content.push(new Paragraph(''));

        const doc = new Document({
            sections: [
                {
                    children: content
                }
            ]
        });
        const buffer = await Packer.toBuffer(doc);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename="FacultyContributions_Report.docx"');
        res.end(buffer);
    } catch (err) {
        console.error(err);
        res.status(500).send('DOCX generation failed');
    }
});

module.exports = router;
