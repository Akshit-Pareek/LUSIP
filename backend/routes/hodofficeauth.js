const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/dashboard', verifyToken, requireRole('HODOFFICE'), (req, res) => {
  res.json({ message: "Welcome to HOD OFFICE dashboard" });
});

module.exports = router;
