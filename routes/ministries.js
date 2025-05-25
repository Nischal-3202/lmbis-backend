

const express = require('express');
const router = express.Router();
const db = require('../firebase');

// POST /ministries - Add a new ministry
router.post('/', async (req, res) => {
  const { ministryName, description, ministerName } = req.body;

  if (!ministryName || !description || !ministerName) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newMinistry = {
      ministryName,
      description,
      ministerName,
      totalOffices: 0,
      createdAt: new Date()
    };

    const docRef = await db.collection('ministries').add(newMinistry);
    res.status(201).json({ message: 'Ministry added successfully', id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add ministry', details: error.message });
  }
});

// GET /ministries - List all ministries
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('ministries').get();
    const ministries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(ministries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ministries', details: error.message });
  }
});

module.exports = router;