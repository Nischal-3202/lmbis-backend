const express = require('express');
const router = express.Router();
const db = require('../firebase');

// POST /users – add a new user
router.post('/', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role are required' });
  }

  try {
    const userRef = db.collection('users').doc(username); // use username as document ID
    await userRef.set({ username, password, role });

    res.status(201).json({ message: 'User added successfully', user: { username, role } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add user', details: err.message });
  }
});

module.exports = router;