const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');
const fs = require('fs');

// Ensure the uploads folder exists
const uploadDir = path.join(__dirname, '../uploads/ResearchCentre');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

// POST: Save research centre event submission
router.post('/', upload.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'report', maxCount: 1 }
]), async (req, res) => {
    try {
        const {
            centreName,
            eventName,
            photoLink,
            department,
        } = req.body;

        const poster = req.files['poster']?.[0]?.path || null;
        const report = req.files['report']?.[0]?.path || null;

        if (!centreName || !eventName || !report || !department) {
            return res.status(400).json({ success: false, error: 'Required fields missing' });
        }

        const [result] = await db.query(`
            INSERT INTO research_centre_events 
            (centre_name, event_name, poster, report, photo_link, department) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [centreName, eventName, poster, report, photoLink, department]);

        res.json({ success: true, id: result.insertId });
    } catch (err) {
        console.error('Insert error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// POST: Add new centre
router.post('/add', async (req, res) => {
  const { name, abbreviation, department } = req.body;
  if (!name || !abbreviation || !department) {
    return res.status(400).json({ success: false, error: 'All fields required' });
  }

  try {
    const q = 'INSERT INTO centres (name, abbreviation, department) VALUES (?, ?, ?)';
    await db.query(q, [name, abbreviation, department]);
    res.json({ success: true });
  } catch (err) {
    console.error('Add centre error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET: Get centres by department
router.get('/:department', async (req, res) => {
  const dept = req.params.department;
  console.log('Fetching centres for department:', dept);
  if (!dept) {
    return res.status(400).json({ success: false, error: 'Department required' });
  }
  try {
    const [rows] = await db.query('SELECT name, abbreviation FROM centres WHERE department = ?', [dept]);
    res.json({ success: true, centres: rows });
  } catch (err) {
    console.error('Fetch centres error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
