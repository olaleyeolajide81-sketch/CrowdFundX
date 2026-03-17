const express = require('express');
const router = express.Router();
const Contribution = require('../models/Contribution');
const Campaign = require('../models/Campaign');
const { body, validationResult } = require('express-validator');

// Create contribution
router.post('/', async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { campaignId, amount, asset } = req.body;
    const contributorId = req.user.id;

    // Check if campaign exists and is active
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Campaign is not active'
      });
    }

    // Create contribution
    const contribution = new Contribution({
      campaign: campaignId,
      contributor: contributorId,
      amount,
      asset: asset || 'XLM',
      transactionHash: 'pending' // Will be updated after blockchain transaction
    });

    await contribution.save();

    // Update campaign funding
    campaign.currentFunding += amount;
    campaign.stats.uniqueContributors += 1;
    await campaign.save();

    // Update user stats
    const User = require('../models/User');
    const user = await User.findById(contributorId);
    await user.updateStats('contribution_made', amount);

    res.status(201).json({
      success: true,
      message: 'Contribution created successfully',
      data: contribution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get contributions for a campaign
router.get('/campaign/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const contributions = await Contribution.find({ campaign: campaignId })
      .populate('contributor', 'username firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contribution.countDocuments({ campaign: campaignId });

    res.json({
      success: true,
      data: contributions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
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
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const contributions = await Contribution.find({ contributor: userId })
      .populate('campaign', 'title slug featuredImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contribution.countDocuments({ contributor: userId });

    res.json({
      success: true,
      data: contributions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get contribution by ID
router.get('/:id', async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id)
      .populate('campaign', 'title slug')
      .populate('contributor', 'username firstName lastName avatar');

    if (!contribution) {
      return res.status(404).json({
        success: false,
        message: 'Contribution not found'
      });
    }

    res.json({
      success: true,
      data: contribution
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
