const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust path as needed
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/BTPDetails');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Route to handle BTP form submission
router.post('/', upload.single('certificate'), async (req, res) => {
  try {
    const { title, students, supervisors, year } = req.body;
    const certificatePath = req.file ? req.file.filename : null;

    // Save as a single record
    const [result] = await db.query(
      'INSERT INTO btp_details (year, title, students, supervisors, certificate_path) VALUES (?, ?, ?, ?, ?)',
      [
        year,
        title,
        students,        // expected to be JSON string from frontend
        supervisors,     // expected to be JSON string from frontend
        certificatePath
      ]
    );

    res.status(201).json({ message: 'BTP details saved successfully' });
  } catch (err) {
    console.error('Error saving BTP details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to handle updating BTP details
router.put('/:id', upload.single('certificate'), async (req, res) => {
  try {
    const id = req.params.id;
    const { title, students, supervisors, year } = req.body;

    const [rows] = await db.query('SELECT certificate_path FROM btp_details WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'BTP Details not found.' });
    }

    let certificatePath = rows[0].certificate_path;

    // If a new certificate is uploaded, replace the old one
    if (req.file) {
      // Delete old certificate file if exists
      if (certificatePath && fs.existsSync(certificatePath)) {
        fs.unlinkSync(certificatePath);
      }
      certificatePath = req.file.path;
    }

    // Build query dynamically based on whether certificate is uploaded
    let query = 'UPDATE btp_details SET year = ?, title = ?, students = ?, supervisors = ?, certificate_path = ? WHERE id = ?';
    let params = [year, title, students, supervisors, certificatePath, id];

    await db.query(query, params);

    res.json({ message: 'BTP details updated successfully' });
  } catch (err) {
    console.error('Error updating BTP details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
