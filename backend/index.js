require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const logger = require('./utils/logger');
const path = require('path');
const passport = require('./config/passport');

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:8080', // Allow only requests from your frontend
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(passport.initialize());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to PostgreSQL
sequelize.authenticate()
  .then(() => logger.info('PostgreSQL connected'))
  .catch(err => logger.error('PostgreSQL connection error:', err));

// Sync models with database
sequelize.sync()
  .then(() => logger.info('Database synced'))
  .catch(err => logger.error('Database sync error:', err));

// Middleware
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to BUXDAO API');
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'An unexpected error occurred' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});