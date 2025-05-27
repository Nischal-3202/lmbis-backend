

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Add new employee
router.post('/', async (req, res) => {
  try {
    const { name, designation, employeeId, level, contact, dob, officeName } = req.body;
    const newEmployee = {
      name,
      designation,
      employeeId,
      level,
      contact,
      dob,
      officeName,
      createdAt: new Date()
    };
    const docRef = await db.collection('employees').add(newEmployee);
    res.status(201).json({ message: 'Employee added successfully', id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all employees by office
router.get('/:officeName', async (req, res) => {
  try {
    const { officeName } = req.params;
    const snapshot = await db.collection('employees').where('officeName', '==', officeName).get();
    const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    await db.collection('employees').doc(id).update(updatedData);
    res.status(200).json({ message: 'Employee updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('employees').doc(id).delete();
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;