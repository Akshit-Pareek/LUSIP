const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/AnnualReports');
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

// POST /api/annual-report
router.post('/', upload.fields([{ name: 'wordFile' }]), async (req, res) => {
    try {
        const { academicYear, category, quarter } = req.body;
        const report_path = req.files['wordFile'] ? req.files['wordFile'][0].path : null;

        if (!academicYear || !category || !report_path) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        await db.query(
            `INSERT INTO annual_reports (academic_year, category, quarter, report_path)
             VALUES (?, ?, ?, ?)`,
            [academicYear, category, quarter || null, report_path]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Annual report upload error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
