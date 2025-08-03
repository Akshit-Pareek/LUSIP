const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db'); // Adjust based on your DB config

// Set up upload storage
const uploadDir = path.join(__dirname, '../uploads/Internships');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  }
});
const upload = multer({ storage });

// POST route
router.post('/', upload.single('certificate'), async (req, res) => {
  try {
    const {
      dateFrom, dateTo,
      firstName, middleName, lastName,
      gender, programme, rollNo,
      department, internshipType,
      companyName, package: pkg,
      stipend, source
    } = req.body;
console.log("Req",req.body);
    const certificatePath = req.file ? req.file.path : null;

    const query = `
      INSERT INTO internships (
        dateFrom, dateTo,
        firstName, middleName, lastName,
        gender, programme, rollNo, department,
        internshipType, companyName,
        package, stipend, source, certificate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      dateFrom, dateTo,
      firstName, middleName, lastName,
      gender, programme, rollNo, department,
      internshipType, companyName,
      pkg || null, stipend || null, source || null,
      certificatePath
    ];

    await db.query(query, values);
    res.status(200).json({ message: 'Internship record saved successfully!' });
  } catch (err) {
    console.error('Error saving internship record:', err);
    res.status(500).json({ error: 'Failed to save internship record.' });
  }
});

router.put('/:id', upload.single('certificate'), async (req, res) => {
  try {
    const {
      dateFrom, dateTo,
      firstName, middleName, lastName,
      gender, programme, rollNo,
      department, internshipType,
      companyName, package: pkg,
      stipend, source
    } = req.body;

    const id = req.params.id;
    // Fetch existing record to get old certificate path
    const [rows] = await db.query('SELECT certificate FROM internships WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Internship record not found.' });
    }

    let certificatePath = rows[0].certificate;

    // If a new certificate is uploaded, replace the old one
    if (req.file) {
      // Delete old certificate file if exists
      if (certificatePath && fs.existsSync(certificatePath)) {
        fs.unlinkSync(certificatePath);
      }
      certificatePath = req.file.path;
    }

    const query = `
      UPDATE internships SET
        dateFrom = ?, dateTo = ?,
        firstName = ?, middleName = ?, lastName = ?,
        gender = ?, programme = ?, rollNo = ?, department = ?,
        internshipType = ?, companyName = ?,
        package = ?, stipend = ?, source = ?, certificate = ?
      WHERE id = ?
    `;

    const values = [
      dateFrom, dateTo,
      firstName, middleName, lastName,
      gender, programme, rollNo, department,
      internshipType, companyName,
      pkg || null, stipend || null, source || null,
      certificatePath, id
    ];

    await db.query(query, values);
    res.status(200).json({ message: 'Internship record updated successfully!' });
  } catch (err) {
    console.error('Error updating internship record:', err);
    res.status(500).json({ error: 'Failed to update internship record.' });
  }
});

module.exports = router;
