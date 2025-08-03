// routes/auth.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  try {
    // 1) Fetch user by email
    const [rows] = await db.query(
      'SELECT employee_id, fname,mname,lname, department, email, password FROM faculty WHERE email = ?',
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = rows[0];

    // 2) Compare hashed password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // 3) Infer role from email prefix
    const lower = email;
    // .toLowerCase();
    let role;
    if (lower.startsWith('hodoffice')) {
      role = 'HODOFFICE';
    } else if (lower.startsWith('hod')) {
      role = 'HOD';
    } else {
      role = 'FACULTY';
    }

    // 4) Sign JWT
    const payload = {
      employee_id: user.employee_id,
      email:     user.email,
      name:      user.name,
      department: user.department,
      role
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

    // 5) Respond
    res.json({ success: true, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
