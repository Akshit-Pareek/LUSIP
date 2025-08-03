const express = require('express');
const ExcelJS = require('exceljs');
const db = require('../db'); // adjust path if needed
const router = express.Router();

router.get('/xlsx', async (req, res) => {
    try {
        const { filterType, academicYear, dateFrom, dateTo } = req.query;
        const params = [];
        let startDate, endDate, startYear, endYear;

        if (filterType === 'year' && academicYear) {
            const [startYearShort, endYearShort] = academicYear.split('-');
            startYear = startYearShort;
            endYear = `20${endYearShort}`;
            startDate = `${startYear}-08-01`;
            endDate = `20${endYearShort}-07-31`;
        } else if (filterType === 'date' && dateFrom && dateTo) {
            startDate = dateFrom;
            endDate = dateTo;
            startYear = String(dateFrom).slice(0, 4);
            endYear = String(dateTo).slice(0, 4);
        } else {
            return res.status(400).json({ message: 'Missing or invalid filter parameters' });
        }

        const filterValue = filterType === 'year' ? academicYear : `${dateFrom} to ${dateTo}`;
        const workbook = new ExcelJS.Workbook();

        const tabs = {
            'Extra Curricular': 'extra_curricular',
            'Internships': 'internships',
            'Placement': 'placement',
            'Competitive Exam': 'competitive_examinations',
            'Higher Education': 'higher_education',
            'BTP Details': 'btp_details',
            'Paper Presentation': 'paper_presentation'
        };

        let rows,merger;
        for (const [tabName, tableName] of Object.entries(tabs)) {
            if (tabName === 'Extra Curricular') {
                const sql = `SELECT title, date, organizer, mode, city, state, country, participants, award_details, photograph_path FROM ${tableName} WHERE date BETWEEN ? AND ? ORDER BY date`;
                [rows] = await db.query(sql, [startDate, endDate]);
                merger='K';
            }
            else if (tabName === 'Internships') {
                const sql = `SELECT firstName, middleName, lastName, gender, programme, rollNo, department, internshipType, companyName, package, stipend, source, dateFrom, dateTo FROM ${tableName} WHERE (dateFrom BETWEEN ? AND ?) OR (dateTo BETWEEN ? AND ?) ORDER BY dateFrom`;
                [rows] = await db.query(sql, [startDate, endDate, startDate, endDate]);
                merger='M';
            }
            else if (tabName === 'Placement') {
                const sql = `SELECT firstName, middleName, lastName, gender, programme, rollNo, department, companyName, package, source FROM ${tableName} WHERE rollNo='abc' ORDER BY rollNo`;
                [rows] = await db.query(sql, [startDate, endDate, startDate, endDate]);
                merger='I';
            }
            else if (tabName === 'Competitive Exam') {
                const sql = `SELECT firstName, middleName, lastName, gender, programme, rollNo, department, examName, examRollNo, yearOfQualification FROM ${tableName} WHERE yearOfQualification BETWEEN ? AND ? ORDER BY yearOfQualification`;
                [rows] = await db.query(sql, [startYear, endYear]);
                merger='I';
            }
            else if (tabName === 'Higher Education') {
                const sql = `SELECT first_name, middle_name, last_name, gender, admitted_programme, department, institute, city, state, country, year FROM ${tableName} WHERE year BETWEEN ? AND ? ORDER BY year`;
                [rows] = await db.query(sql, [startYear, endYear]);
                merger='J';
            }
            else if (tabName === 'BTP Details') {
                const sql = `SELECT  title, students, supervisors, year FROM ${tableName} WHERE year = ?`;
                [rows] = await db.query(sql, [academicYear]);
                merger='E';
            }
            else if (tabName === 'Paper Presentation') {
                const sql = `SELECT firstName, middleName, lastName, rollNo, programme, department, paperTitle, mode, sponsoringAgency, eventTitle, abbreviation, fundedByInstitute, amountFunded, organizer,  venueCity, venueState, venueCountry, fromDate, toDate, achievement FROM ${tableName} WHERE (fromDate BETWEEN ? AND ?) OR (toDate BETWEEN ? AND ?) ORDER BY fromDate`;
                [rows] = await db.query(sql, [startDate, endDate, startDate, endDate]);
                merger='S';
            }

            if (rows.length == 0) continue;
            const sheet = workbook.addWorksheet(tabName);
            // Title Row
            sheet.mergeCells(`A1:${merger}1`);
            sheet.getCell('A1').value = `List of ${tabName} (Sorted by ${filterType === 'year' ? `Year ${academicYear}` : `Date ${dateFrom} - ${dateTo}`})`;
            sheet.getCell('A1').font = { bold: true, size: 20 };
            sheet.getCell('A1').alignment = { horizontal: 'center' };

            // Blank Row
            sheet.addRow([]);

            const headers = [];
            const keySet = rows.length > 0 ? Object.keys(rows[0]) : [];

            // Handle name fields
            const hasFirstName = keySet.includes('firstName');
            const hasFirst_name = keySet.includes('first_name');

            if (hasFirstName) {
                headers.push({ head: 'Name', tail: ['firstName', 'middleName', 'lastName'] });
            }
            if (hasFirst_name) {
                headers.push({ head: 'Name', tail: ['first_name', 'middle_name', 'last_name'] });
            }


            // Handle remaining fields
            keySet.forEach(key => {
                if (['firstName', 'middleName', 'lastName', 'first_name', 'middle_name', 'last_name'].includes(key)) return; // Already handled
                headers.push({
                    head: key
                        .replace(/_/g, ' ')
                        .replace(/([a-z])([A-Z])/g, '$1 $2')
                        .replace(/\b\w/g, c => c.toUpperCase()),
                    tail: key
                });
            });

            // Add header row
            const headerRow = ['S. No.', ...headers.map(h => h.head)];
            sheet.addRow(headerRow).eachCell(cell => {
                cell.font = { bold: true };
            });

            // Data Rows
            rows.forEach((row, idx) => {
                const rowData = [idx + 1];

                headers.forEach(h => {
                    if (Array.isArray(h.tail)) {
                        // Name fields
                        const [fn, mn, ln] = h.tail.map(k => row[k] || '');
                        const fullName = [fn, mn, ln].filter(Boolean).join(' ').trim();
                        rowData.push(fullName || 'N/A');
                    } else {
                        let val = row[h.tail];

                        // If array of participants/students/supervisors
                        if (Array.isArray(val)) {
                            const formatted = val.map(p => {
                                const fullName = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ');
                                const meta = [p.department, p.rollno, p.programme].filter(Boolean).join(', ');
                                return `${fullName}${meta ? ` (${meta})` : ''}`;
                            }).join('; ');
                            rowData.push(formatted || 'N/A');
                        } else {
                            if (val instanceof Date) {
                                val = String(val).slice(0, 15);
                            }
                            rowData.push(val ?? 'N/A');
                        }
                    }
                    console.log('Row:',rowData)
                });

                sheet.addRow(rowData).eachCell(cell => {
                    cell.font = { bold: false }; // Data row (optional: make bold)
                    cell.alignment = { wrapText: true };
                });
            });


            // Auto column widths
            sheet.columns.forEach(column => {
                let maxLength = 10;
                column.eachCell({ includeEmpty: true }, cell => {
                    if (cell.row <= 2) return;
                    const val = cell.value ? cell.value.toString() : '';
                    maxLength = Math.max(maxLength, val.length);
                });
                column.width = maxLength + 2;
            });

            // Add border to all cells
            sheet.eachRow(row => {
                row.eachCell(cell => {
                    cell.border = {
                        top: { style: 'thin' },
                        bottom: { style: 'thin' },
                        left: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Student_Module_Report.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error('XLSX Generation Error:', err);
        res.status(500).json({ message: 'Error generating report' });
    }
});

module.exports = router;
