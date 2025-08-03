// routes/higherEducation.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // your database connection module
const multer = require('multer');
const upload = multer();

router.post('/',upload.none(), async (req, res) => {
  try {
    const {
      year,
      firstName,
      middleName,
      lastName,
      gender,
      admittedProgramme,
      department,
      institute,
      city,
      state,
      country
    } = req.body;

    const sql = `
      INSERT INTO higher_education (
        year,
        first_name, middle_name, last_name,
        gender, admitted_programme, department,
        institute, city, state, country
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(sql, [
      year,
      firstName,
      middleName,
      lastName,
      gender,
      admittedProgramme,
      department,
      institute,
      city,
      state,
      country
    ]);

    res.status(200).json({ message: 'Higher education entry saved successfully.' });
  } catch (error) {
    console.error('Insert Error:', error);
    res.status(500).json({ error: 'Failed to save higher education data' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const {
      year,
      firstName,
      middleName,
      lastName,
      gender,
      admittedProgramme,
      department,
      institute,
      city,
      state,
      country
    } = req.body;

    const sql = `
      UPDATE higher_education SET
        year = ?,
        first_name = ?,
        middle_name = ?,
        last_name = ?,
        gender = ?,
        admitted_programme = ?,
        department = ?,
        institute = ?,
        city = ?,
        state = ?,
        country = ?
      WHERE id = ?
    `;

    await db.query(sql, [
      year,
      firstName,
      middleName,
      lastName,
      gender,
      admittedProgramme,
      department,
      institute,
      city,
      state,
      country,
      req.params.id
    ]);

    res.status(200).json({ message: 'Higher education entry updated successfully.' });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ error: 'Failed to update higher education data' });
  }
});

module.exports = router;
