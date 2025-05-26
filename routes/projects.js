


const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = require('../firebase');

// POST /projects - Add new project and increment office project count
router.post('/', async (req, res) => {
  const { projectName, officeName, ministryName, description, fiscalYear } = req.body;

  if (!projectName || !officeName || !ministryName || !fiscalYear) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  try {
    const newProject = {
      projectName,
      officeName,
      ministryName,
      description: description || '',
      fiscalYear,
      createdAt: new Date()
    };

    await db.collection('projects').add(newProject);

    const officeRef = db.collection('offices').where('officeName', '==', officeName);
    const snapshot = await officeRef.get();
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      await doc.ref.update({
        projects: admin.firestore.FieldValue.increment(1)
      });
    }

    res.status(201).json({ message: 'Project created and office updated successfully' });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// GET /projects/:officeName - List all projects for a given office
router.get('/:officeName', async (req, res) => {
  const { officeName } = req.params;

  try {
    const snapshot = await db.collection('projects')
      .where('officeName', '==', officeName)
      .get();

    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

module.exports = router;