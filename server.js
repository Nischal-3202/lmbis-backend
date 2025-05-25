const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const fundRoutes = require('./routes/funds');
const ministryRoutes = require('./routes/ministries');
const budgetRoutes = require('./routes/budgets');

app.use(express.json());
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/funds', fundRoutes);
app.use('/ministries', ministryRoutes);
app.use('/budgets', budgetRoutes);

const PORT = 2000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});