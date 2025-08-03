const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db'); // your DB connection file

// File storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/CompetitiveExams');
    // Ensure uploads folder exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `certificate_${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

router.post('/', upload.single('certificate'), async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      gender,
      programme,
      rollNo,
      department,
      examName,
      examRollNo,
      yearOfQualification,
    } = req.body;

    const certificatePath = req.file ? req.file.path : null;

    const query = `
      INSERT INTO competitive_examinations (
        firstName, middleName, lastName, gender, programme, rollNo, department,
        examName, examRollNo, yearOfQualification, certificatePath
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      firstName,
      middleName,
      lastName,
      gender,
      programme,
      rollNo,
      department,
      examName,
      examRollNo,
      yearOfQualification,
      certificatePath,
    ];

    await db.query(query, values);
    res.status(200).json({ message: 'Competitive exam details saved successfully.' });
  } catch (err) {
    console.error('Insert Error:', err);
    res.status(500).json({ error: 'Failed to save competitive exam data.' });
  }
});

router.put('/:id', upload.single('certificate'), async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      gender,
      programme,
      rollNo,
      department,
      examName,
      examRollNo,
      yearOfQualification,
    } = req.body;

    const [rows] = await db.query('SELECT certificatePath FROM competitive_examinations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    let certificatePath = rows[0].certificatePath;

    // If a new certificate is uploaded, replace the old one
    if (req.file) {
      // Delete old certificate file if exists
      if (certificatePath && fs.existsSync(certificatePath)) {
        fs.unlinkSync(certificatePath);
      }
      certificatePath = req.file.path;
    }

    const query = `
      UPDATE competitive_examinations SET
        firstName = ?, middleName = ?, lastName = ?, gender = ?, programme = ?, rollNo = ?, department = ?,
        examName = ?, examRollNo = ?, yearOfQualification = ?, certificatePath = ?
      WHERE id = ?
    `;

    const values = [
      firstName,
      middleName,
      lastName,
      gender,
      programme,
      rollNo,
      department,
      examName,
      examRollNo,
      yearOfQualification,
      certificatePath,
      req.params.id,
    ];

    await db.query(query, values);
    res.status(200).json({ message: 'Competitive exam details updated successfully.' });
  } catch (err) {
    console.error('Update Error:', err);
    res.status(500).json({ error: 'Failed to update competitive exam data.' });
  }
});

module.exports = router;
