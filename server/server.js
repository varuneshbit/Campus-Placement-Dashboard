const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Load env vars
dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/placementDB')
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Set static folder
app.use('/uploads', express.static('uploads'));

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/drives', require('./routes/drives'));
app.use('/api/students', require('./routes/students'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/events', require('./routes/events'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/analytics', require('./routes/analytics'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
