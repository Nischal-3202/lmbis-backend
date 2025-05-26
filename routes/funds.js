const express = require('express');
const router = express.Router();
const db = require('../firebase');

// GET /funds - Admin fetches all fund requests
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('funds').get();
    const funds = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(funds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fund requests', details: error.message });
  }
});

// POST /funds - Office submits a fund request
router.post('/', async (req, res) => {
  const { title, description, project, amount, fiscalYear, officeName, ministryName } = req.body;

  if (!title || !description || !project || !amount || !fiscalYear || !officeName || !ministryName) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newRequest = {
      title,
      description,
      project,
      amount,
      fiscalYear,
      officeName,
      ministryName,
      status: 'pending',
      timestamp: new Date()
    };

    const docRef = await db.collection('funds').add(newRequest);
    res.status(201).json({ message: 'Fund request submitted', id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit fund request', details: error.message });
  }
});

// PUT /funds/:id/approve - Admin approves a fund request
router.put('/:id/approve', async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection('funds').doc(id).update({ status: 'approved' });
    res.json({ message: 'Fund request approved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve request', details: error.message });
  }
});

// PUT /funds/:id/reject - Admin rejects a fund request
router.put('/:id/reject', async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection('funds').doc(id).update({ status: 'rejected' });
    res.json({ message: 'Fund request rejected' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject request', details: error.message });
  }
});

module.exports = router;