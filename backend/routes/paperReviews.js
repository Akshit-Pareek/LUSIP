const express = require('express');
const router = express.Router();
const db = require('../db');
const ExcelJS = require('exceljs');

// You may replace this with your actual DB logic
// For example: const db = require('../config/db');

router.post('/', async (req, res) => {
    try {
        const {
            type = 'Journal', // Default value if not provided
            firstName,
            middleName,
            lastName,
            nameOfPublication,
            abbreviation,
            numberOfPapers,
            month
        } = req.body;

        if (
            !type || !firstName || !lastName ||
            !nameOfPublication || !numberOfPapers || !month
        ) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const sql = `
            INSERT INTO paper_reviews 
            (type, first_name, middle_name, last_name, name_of_publication, abbreviation, number_of_papers, month)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            type,
            firstName,
            middleName,
            lastName,
            nameOfPublication,
            abbreviation,
            numberOfPapers,
            month
        ];
        // Replace with your actual DB query logic
        await db.query(sql, values);
        console.log("Saved data:", values); // Debug
        res.status(201).json({ message: 'Paper review submitted successfully' });
    } catch (err) {
        console.error('Error saving paper review:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            type = 'Journal',
            firstName,
            middleName,
            lastName,
            nameOfPublication,
            abbreviation,
            numberOfPapers,
            month
        } = req.body;

        if (
            !type || !firstName || !lastName ||
            !nameOfPublication || !numberOfPapers || !month
        ) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const sql = `
            UPDATE paper_reviews
            SET type = ?, first_name = ?, middle_name = ?, last_name = ?, name_of_publication = ?, abbreviation = ?, number_of_papers = ?, month = ?
            WHERE id = ?
        `;
        const values = [
            type,
            firstName,
            middleName,
            lastName,
            nameOfPublication,
            abbreviation,
            numberOfPapers,
            month,
            id
        ];

        const result = await db.query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Paper review not found' });
        }

        res.json({ message: 'Paper review updated successfully' });
    } catch (err) {
        console.error('Error updating paper review:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/xlsx', async (req, res) => {
    try {
        const { filterType, dateFrom, dateTo, academicYear } = req.query;

        let sql = 'SELECT * FROM paper_reviews';
        let whereClauses = [];
        let params = [];

        if (filterType === 'date' && dateFrom && dateTo) {
            whereClauses.push(`(month BETWEEN ? AND ?)`);
            params.push(String(dateFrom).slice(0,7), String(dateTo).slice(0,7));  // 'YYYY-MM' format will work fine
        }
        if (filterType === 'year' && academicYear) {
            const [startYear, endYearShort] = academicYear.split('-');
            const start = `${startYear}-08`;               // Academic year starts from August
            const end = `20${endYearShort}-07`;            // Ends in July next year

            whereClauses.push(`(month BETWEEN ? AND ?)`);
            params.push(start, end);
        }


        if (whereClauses.length > 0) {
            sql += ' WHERE ' + whereClauses.join(' AND ');
        }

        sql += ' ORDER BY type, month';
        const [rows] = await db.query(sql, params);

        if (!rows || rows.length === 0) {
            return res.status(404).send('<script>alert("No data found!"); window.history.back();</script>');
        }

        const grouped = rows.reduce((acc, row) => {
            if (!acc[row.type]) acc[row.type] = [];
            acc[row.type].push(row);
            return acc;
        }, {});

        const workbook = new ExcelJS.Workbook();

        const headers = [
            { header: 'S. No.', key: 'sno' },
            { header: 'Reviewer Name', key: 'name' },
            { header: 'Name of Publication', key: 'name_of_publication' },
            { header: 'Abbreviation', key: 'abbreviation' },
            { header: 'Number of Papers', key: 'number_of_papers' },
            { header: 'Month', key: 'month' }
        ];

        for (const type of Object.keys(grouped)) {
            const sheet = workbook.addWorksheet(type);
            let rowIndex = 1;

            // Title Row
            const title = `List of ${type} (Sorted by ${filterType==='year'?`Year ${academicYear}`:`Date ${dateFrom} - ${dateTo}`})`;
            sheet.mergeCells(`A${rowIndex}:${String.fromCharCode(64 + headers.length)}${rowIndex}`);
            const titleCell = sheet.getCell(`A${rowIndex}`);
            titleCell.value = title;
            titleCell.font = { bold: true, size: 20 };
            titleCell.alignment = { horizontal: 'center', wrapText:true };
            sheet.addRow([]);
            rowIndex += 2;

            // Header Row
            sheet.addRow(headers.map(h => h.header));
            const headerRow = sheet.getRow(rowIndex);
            headerRow.font = { bold: true };

            // Data Rows
            grouped[type].forEach((r, idx) => {
                const fullName = [r.first_name, r.middle_name, r.last_name].filter(Boolean).join(' ');
                const rowData = [
                    idx + 1,
                    fullName,
                    r.name_of_publication,
                    r.abbreviation || 'N/A',
                    r.number_of_papers,
                    String(r.month).slice(0,15)
                ];
                sheet.addRow(rowData);
                console.log("Row:",rowData);
            });

            // Auto-width
            sheet.columns.forEach((col, i) => {
                let maxLen = headers[i]?.header?.length || 10;
                col.eachCell({ includeEmpty: true }, cell => {
                    if(cell.row<=2) return;
                    const val = (cell.value || '').toString();
                    maxLen = Math.max(maxLen, val.length);
                });
                col.width = maxLen + 2;
            });

            // Apply borders
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
        res.setHeader('Content-Disposition', `attachment; filename="Paper_Reviews_Report.xlsx"`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error('Error generating XLSX:', err);
        res.status(500).send('Error generating Excel');
    }
});

module.exports = router;
