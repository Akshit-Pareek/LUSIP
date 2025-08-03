const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust if your DB file is elsewhere

router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      gender,
      programme,
      rollNo,
      department,
      companyName,
      package: pkg,
      source,
    } = req.body;

    const sql = `
      INSERT INTO placement 
        (firstName, middleName, lastName, gender, programme, rollNo, department, companyName, package, source) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [firstName, middleName, lastName, gender, programme, rollNo, department, companyName, pkg, source];

    await db.query(sql, values);

    res.status(200).json({ message: 'Placement record inserted successfully' });
  } catch (err) {
    console.error('Insert Error:', err);
    res.status(500).json({ error: 'Insertion failed' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      gender,
      programme,
      rollNo,
      department,
      companyName,
      package: pkg,
      source,
    } = req.body;

    const sql = `
      UPDATE placement SET
        firstName = ?,
        middleName = ?,
        lastName = ?,
        gender = ?,
        programme = ?,
        rollNo = ?,
        department = ?,
        companyName = ?,
        package = ?,
        source = ?
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
      companyName,
      pkg,
      source,
      req.params.id,
    ];

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Placement record not found' });
    }

    res.status(200).json({ message: 'Placement record updated successfully' });
  } catch (err) {
    console.error('Update Error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;
