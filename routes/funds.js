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
    const fundRef = db.collection('funds').doc(id);
    const fundDoc = await fundRef.get();

    if (!fundDoc.exists) {
      return res.status(404).json({ error: 'Fund request not found' });
    }

    const fundData = fundDoc.data();

    await fundRef.update({ status: 'approved' });

    // Deduct from project's budgetRemaining
    const projectSnapshot = await db.collection('projects')
      .where('projectName', '==', fundData.project)
      .where('officeName', '==', fundData.officeName)
      .limit(1)
      .get();

    if (!projectSnapshot.empty) {
      const projectDoc = projectSnapshot.docs[0];
      const projectRef = db.collection('projects').doc(projectDoc.id);
      const currentRemaining = projectDoc.data().budgetRemaining || 0;
      const updatedRemaining = currentRemaining - fundData.amount;

      await projectRef.update({ budgetRemaining: updatedRemaining });
    }

    res.json({ message: 'Fund request approved and budget deducted' });
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