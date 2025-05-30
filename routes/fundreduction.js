const express = require('express');
const router = express.Router();
const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

// POST route to create a project and deduct funds from ministry
router.post('/fundreduction', async (req, res) => {
  try {
    const {
      projectName,
      description,
      budgetAllocated,
      ministryName,
      officeName,
      fiscalYear
    } = req.body;

    // Step 1: Get the ministry document
    const ministriesSnapshot = await db.collection('ministries').where('ministryName', '==', ministryName).get();
    if (ministriesSnapshot.empty) {
      return res.status(404).json({ message: 'Ministry not found' });
    }

    const ministryDoc = ministriesSnapshot.docs[0];
    const ministryData = ministryDoc.data();

    // Step 2: Check if enough budget is available
    if ((ministryData.totalBudget - ministryData.usedBudget) < budgetAllocated) {
      return res.status(400).json({ message: 'Insufficient ministry funds' });
    }

    // Step 3: Deduct the budget
    await db.collection('ministries').doc(ministryDoc.id).update({
      usedBudget: (ministryData.usedBudget || 0) + budgetAllocated
    });

    // Step 4: Create the project
    const newProject = {
      projectName,
      description,
      budgetAllocated,
      budgetRemaining: budgetAllocated,
      ministryName,
      officeName,
      fiscalYear,
      createdAt: new Date()
    };

    const projectRef = await db.collection('projects').add(newProject);

    return res.status(201).json({ message: 'Project created and funds deducted', projectId: projectRef.id });
  } catch (error) {
    console.error('Error creating project with fund deduction:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;