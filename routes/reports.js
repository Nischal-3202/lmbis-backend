

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

router.post('/', async (req, res) => {
  const { reportType, fiscalYear, office, ministry, dateRange } = req.body;
  const db = admin.firestore();

  try {
    let collectionRef;
    let query = null;

    if (reportType === 'Fund Transfer') {
      let query = db.collection('funds');

      if (fiscalYear) query = query.where('fiscalYear', '==', fiscalYear);
      if (office) query = query.where('office', '==', office);
      if (dateRange?.start && dateRange?.end) {
        query = query.where('timestamp', '>=', new Date(dateRange.start));
        query = query.where('timestamp', '<=', new Date(dateRange.end));
      }

      const snapshot = await query.get();
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          amount: d.amount,
          office: d.office,
          purpose: d.purpose,
          status: d.status,
          fiscalYear: d.fiscalYear,
          timestamp: d.timestamp?.toDate().toLocaleDateString() || 'N/A'
        };
      });

      return res.json(data);
    } else if (reportType === 'Office Activity') {
      collectionRef = db.collection('offices');
      query = collectionRef;
      if (ministry) query = query.where('ministry', '==', ministry);
    } else if (reportType === 'Ministry Budget') {
      collectionRef = db.collection('ministries');
      query = collectionRef;
    } else {
      return res.status(400).json({ message: 'Invalid report type' });
    }

    const snapshot = await query.get();
    const data = snapshot.docs.map(doc => doc.data());

    return res.json(data);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;