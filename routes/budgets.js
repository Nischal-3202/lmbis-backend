const express = require('express');
const router = express.Router();
const db = require('../firebase');

// POST /budgets - Add or update budget for a ministry
router.post('/', async (req, res) => {
  const { ministryName, fiscalYear, allocated } = req.body;

  if (!ministryName || !fiscalYear || !allocated) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const budgetRef = db.collection('budgets').doc(ministryName);
    const budgetDoc = await budgetRef.get();

    const newBudget = {
      ministryName,
      fiscalYear,
      allocated,
      remaining: allocated,
      updatedAt: new Date()
    };

    if (budgetDoc.exists) {
      await budgetRef.update(newBudget);
      res.json({ message: 'Budget updated successfully' });
    } else {
      await budgetRef.set(newBudget);
      res.status(201).json({ message: 'Budget set successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to set budget', details: error.message });
  }
});

// GET /budgets - List all budgets
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('budgets').get();
    const budgets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budgets', details: error.message });
  }
});

module.exports = router;