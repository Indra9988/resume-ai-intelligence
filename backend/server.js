require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/jobs',   require('./routes/jobRoutes'));
app.use('/api/match',  require('./routes/matchRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Resume AI Backend is running' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log('SERVER STARTED on http://localhost:' + PORT);
  console.log('MongoDB: ' + (process.env.MONGO_URI || 'mongodb://localhost:27017/resumeai'));
  console.log('ML API:  ' + (process.env.ML_API_URL || 'http://localhost:5001'));
});
