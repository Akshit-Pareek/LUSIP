const express = require('express');
const router = express.Router();
const db = require('../db'); // Your MySQL connection
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create folder if not exists
const uploadDir = path.join(__dirname, '../uploads/PaperPresentation');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  },
});
const upload = multer({ storage });

router.post('/', upload.single('certificate'), async (req, res) => {
  try {
    const {
      student,
      paperTitle,
      mode,
      sponsoringAgency,
      eventTitle,
      abbreviation,
      fundedByInstitute,
      amountFunded,
      organizer,
      venue,
      fromDate,
      toDate,
      achievement
    } = req.body;

    const studentData = JSON.parse(student);
    const venueData = JSON.parse(venue);

    const certPath = req.file ? req.file.path : null;

    const sql = `INSERT INTO paper_presentation (
      firstName, middleName, lastName, rollNo, programme, department,
      paperTitle, mode, sponsoringAgency, eventTitle, abbreviation,
      fundedByInstitute, amountFunded, organizer,
      venueCity, venueState, venueCountry,
      fromDate, toDate, achievement, certificate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      studentData.firstName,
      studentData.middleName,
      studentData.lastName,
      studentData.rollNo,
      studentData.programme,
      studentData.department,
      paperTitle,
      mode,
      sponsoringAgency,
      eventTitle,
      abbreviation,
      fundedByInstitute,
      fundedByInstitute === 'Yes' ? amountFunded : null,
      organizer,
      venueData.city,
      venueData.state,
      venueData.country,
      fromDate,
      toDate,
      achievement,
      certPath,
    ];

    await db.query(sql, values);
    res.status(200).json({ success: true, message: 'Paper Presentation submitted' });
  } catch (err) {
    console.error('Error in PaperPresentation POST:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id', upload.single('certificate'), async (req, res) => {
  try {
    const {
      student,
      paperTitle,
      mode,
      sponsoringAgency,
      eventTitle,
      abbreviation,
      fundedByInstitute,
      amountFunded,
      organizer,
      venue,
      fromDate,
      toDate,
      achievement
    } = req.body;

    const studentData = JSON.parse(student);
    const venueData = JSON.parse(venue);

    const id = req.params.id;
    // Fetch existing record to get old certificate path
    const [rows] = await db.query('SELECT certificate FROM paper_presentation WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Paper Presentation record not found.' });
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

    const sql = `UPDATE paper_presentation SET
      firstName = ?, middleName = ?, lastName = ?, rollNo = ?, programme = ?, department = ?,
      paperTitle = ?, mode = ?, sponsoringAgency = ?, eventTitle = ?, abbreviation = ?,
      fundedByInstitute = ?, amountFunded = ?, organizer = ?,
      venueCity = ?, venueState = ?, venueCountry = ?,
      fromDate = ?, toDate = ?, achievement = ?, certificate = ?
      WHERE id = ?`;

    const values = [
      studentData.firstName,
      studentData.middleName,
      studentData.lastName,
      studentData.rollNo,
      studentData.programme,
      studentData.department,
      paperTitle,
      mode,
      sponsoringAgency,
      eventTitle,
      abbreviation,
      fundedByInstitute,
      fundedByInstitute === 'Yes' ? amountFunded : null,
      organizer,
      venueData.city,
      venueData.state,
      venueData.country,
      fromDate,
      toDate,
      achievement,
      certificatePath,
      id
    ];

    await db.query(sql, values);
    res.status(200).json({ success: true, message: 'Paper Presentation updated' });
  } catch (err) {
    console.error('Error in PaperPresentation PUT:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
