const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/dashboard', verifyToken, requireRole('HOD'), (req, res) => {
  res.json({ message: "Welcome to HOD dashboard" });
});

module.exports = router;
