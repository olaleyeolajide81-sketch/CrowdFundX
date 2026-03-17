const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-__v')
      .populate('stats');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { firstName, lastName, bio, preferences } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $set: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(bio && { bio }),
          ...(preferences && { preferences })
        }
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Upload avatar
router.post('/avatar', async (req, res) => {
  try {
    // TODO: Implement file upload logic
    res.json({
      success: true,
      message: 'Avatar uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get user's campaigns
router.get('/campaigns', async (req, res) => {
  try {
    const Campaign = require('../models/Campaign');
    const campaigns = await Campaign.find({ creator: req.user.id })
      .select('title status fundingGoal currentFunding deadline createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: campaigns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get user's contributions
router.get('/contributions', async (req, res) => {
  try {
    const Contribution = require('../models/Contribution');
    const contributions = await Contribution.find({ contributor: req.user.id })
      .populate('campaign', 'title slug')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: contributions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
