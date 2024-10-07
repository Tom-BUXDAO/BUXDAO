const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticateToken = require('../middleware/authenticateToken');
const User = require('../models/User'); // Make sure to import your User model
const logger = require('../utils/logger');

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// GET all users (protected route)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'profilePictureUrl']
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET user profile (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['id', 'username', 'email', 'profilePictureUrl']
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single user by ID (protected route)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'email', 'profilePictureUrl']
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Change profile picture route
router.post('/change-pfp', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  logger.info('Change PFP route hit');
  if (!req.file) {
    logger.info('No file uploaded');
    return res.status(400).json({ message: 'No file uploaded' });
  }

  logger.info('File uploaded:', req.file);
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldProfilePicture = user.profilePictureUrl;

    // Update user's profile picture URL in the database
    const profilePictureUrl = `/uploads/${req.file.filename}`;
    user.profilePictureUrl = profilePictureUrl;
    await user.save();

    // Delete old profile picture if it's not the default
    if (oldProfilePicture && oldProfilePicture !== 'default-pfp.jpg') {
      const oldFilePath = path.join(__dirname, '..', 'uploads', path.basename(oldProfilePicture));
      fs.unlink(oldFilePath, (err) => {
        if (err) logger.error('Error deleting old profile picture:', err);
      });
    }

    res.json({ message: 'Profile picture updated successfully', profilePictureUrl });
  } catch (error) {
    logger.error('Error updating profile picture:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete account route
router.delete('/delete-account', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const deletedUser = await User.destroy({ where: { id: userId } });
        
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        logger.error('Error deleting account:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;