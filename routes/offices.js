const express = require('express');
const router = express.Router();
const db = require('../firebase');

// POST /offices - Add a new office
router.post('/', async (req, res) => {
  const { officeName, location, ministryName } = req.body;

  if (!officeName || !location || !ministryName) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newOffice = {
      officeName,
      location,
      ministryName,
      employees: 0,
      projects: 0,
      createdAt: new Date()
    };

    const docRef = await db.collection('offices').add(newOffice);
    res.status(201).json({ message: 'Office added successfully', id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add office', details: error.message });
  }
});

// GET /offices - List all offices
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('offices').get();
    const offices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(offices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offices', details: error.message });
  }
});

// GET /offices/name/:name - Get office by officeName
router.get('/name/:name', async (req, res) => {
  const officeName = decodeURIComponent(req.params.name).trim();
  console.log('Requested office name:', officeName);

  try {
    const allSnapshot = await db.collection('offices').get();
    allSnapshot.forEach(doc => {
      console.log('Available in DB:', doc.data().officeName);
    });

    const snapshot = await db.collection('offices')
      .where('officeName', '==', officeName)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Office not found' });
    }

    const office = snapshot.docs[0].data();
    res.json(office);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch office', details: error.message });
  }
});

// GET /offices/:ministry - List offices by ministry name
router.get('/:ministry', async (req, res) => {
  const { ministry } = req.params;

  try {
    const snapshot = await db.collection('offices')
      .where('ministryName', '==', ministry)
      .get();

    const offices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(offices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offices for ministry', details: error.message });
  }
});

module.exports = router;