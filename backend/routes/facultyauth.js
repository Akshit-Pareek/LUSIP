const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/dashboard', verifyToken, requireRole('FACULTY'), (req, res) => {
  res.json({ message: "Welcome to FACULTY dashboard" });
});

module.exports = router;
