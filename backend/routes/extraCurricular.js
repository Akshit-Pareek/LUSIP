const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/ExtraCurricular');
        // Ensure uploads folder exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });

router.post('/',
    upload.fields([
        { name: 'certificate', maxCount: 1 },
        { name: 'eventReport', maxCount: 1 },
        // { name: 'photograph', maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            const {
                title,
                date,
                organizer,
                mode,
                city,
                state,
                country,
                awardDetails,
                participants,
                photograph
            } = req.body;
            const certificate = req.files?.certificate?.[0]?.path || '';
            const eventReport = req.files?.eventReport?.[0]?.path || '';
            // const photograph = req.files?.photograph?.[0]?.path || '';
            //   const certificate = req.files['certificate']? req.files['certificate'].path : null;
            //   const eventReport = req.files['eventReport']? req.files['eventReport'].path : null;
            //   const photograph = req.files['photograph']? req.files['photograph'].path : null;

            const insertQuery = `
        INSERT INTO extra_curricular (
          title,
          date,
          organizer,
          mode,
          city,
          state,
          country,
          participants,
          award_details,
          certificate_path,
          event_report_path,
          photograph_path
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

            await pool.query(insertQuery, [
                title,
                date,
                organizer,
                mode,
                city || null,
                state || null,
                country || null,
                JSON.stringify(JSON.parse(participants)), // ensure it's valid JSON
                awardDetails,
                certificate,
                eventReport,
                photograph,
            ]);

            res.status(200).json({ message: 'Extra Curricular entry saved successfully.' });
        } catch (error) {
            console.error('Insert Error:', error);
            res.status(500).json({ error: 'Failed to insert Extra Curricular entry.' });
        }
    }
);

router.put('/:id',
    upload.fields([
        { name: 'certificate', maxCount: 1 },
        { name: 'eventReport', maxCount: 1 },
        // { name: 'photograph', maxCount: 1 },
    ]),
    async (req, res) => {
        const id = req.params.id;
        try {
            const {
                title,
                date,
                organizer,
                mode,
                city,
                state,
                country,
                awardDetails,
                participants,
                photograph
            } = req.body;
            console.log('Update Request Body:', req.body);
            const certificate = req.files?.certificate?.[0]?.path || null;
            const eventReport = req.files?.eventReport?.[0]?.path || null;
            // const photograph = req.files?.photograph?.[0]?.path || null;

            const updateQuery = `
        UPDATE extra_curricular
        SET title = ?, date = ?, organizer = ?, mode = ?,
            city = ?, state = ?, country = ?, participants = ?,
            award_details = ?, photograph_path = ?
            ${certificate ? ', certificate_path = ?' : ''}
            ${eventReport ? ', event_report_path = ?' : ''}
        WHERE id = ?
      `;

            const values = [
                title, date, organizer, mode, city, state, country,
                JSON.stringify(JSON.parse(participants)), awardDetails, photograph
            ]
            if (certificate) {
                values.push(certificate);
            }
            if (eventReport) {
                values.push(eventReport);
            }
            values.push(id);
            console.log('Update Values:', values);
            await pool.query(updateQuery, values);

            res.status(200).json({ message: 'Extra Curricular entry updated successfully.' });
        } catch (error) {
            console.error('Update Error:', error);
            res.status(500).json({ error: 'Failed to update Extra Curricular entry.' });
        }
    }
);

module.exports = router;
