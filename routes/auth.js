

const express = require('express');
const router = express.Router();
const db = require('../firebase');

// POST /auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const userRef = db.collection('users').doc(username);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = doc.data();

    if (user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    res.json({
      message: 'Login successful',
      username: user.username,
      role: user.role
    });

  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

module.exports = router;