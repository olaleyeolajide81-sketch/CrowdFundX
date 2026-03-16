const Campaign = require('../models/Campaign');
const Contribution = require('../models/Contribution');
const User = require('../models/User');
const stellarService = require('../services/stellarService');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class CampaignController {
  // Create a new campaign
  async createCampaign(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const campaignData = {
        ...req.body,
        creator: req.user.id,
        slug: await this.generateUniqueSlug(req.body.title)
      };

      const campaign = new Campaign(campaignData);
      await campaign.save();

      // Update user stats
      const user = await User.findById(req.user.id);
      await user.updateStats('campaign_created');

      // Deploy smart contract if campaign is active
      if (campaign.status === 'active') {
        try {
          const contractAddress = await stellarService.deployCampaignContract(campaign);
          campaign.stellarContractId = contractAddress;
          await campaign.save();
        } catch (contractError) {
          logger.error('Failed to deploy campaign contract:', contractError);
          // Don't fail campaign creation if contract deployment fails
        }
      }

      res.status(201).json({
        success: true,
        message: 'Campaign created successfully',
        data: await Campaign.findById(campaign._id)
          .populate('creator', 'username firstName lastName avatar isVerified')
      });

    } catch (error) {
      logger.error('Error creating campaign:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create campaign',
        error: error.message
      });
    }
  }

  // Get all campaigns with filtering and pagination
  async getCampaigns(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        status,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        featured,
        minGoal,
        maxGoal
      } = req.query;

      const options = {
        category,
        status,
        sortBy,
        sortOrder: sortOrder === 'desc' ? -1 : 1,
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
        minGoal: minGoal ? parseFloat(minGoal) : undefined,
        maxGoal: maxGoal ? parseFloat(maxGoal) : undefined
      };

      let campaigns;
      
      if (featured === 'true') {
        campaigns = await Campaign.findFeatured(parseInt(limit));
      } else if (search) {
        campaigns = await Campaign.search(search, options);
      } else {
        campaigns = await Campaign.findActive({
          ...(category && { category }),
          ...(status && { status })
        })
          .populate('creator', 'username firstName lastName avatar isVerified')
          .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
          .limit(parseInt(limit))
          .skip(options.skip);
      }

      const total = await Campaign.countDocuments(
        Campaign.getActive({
          ...(category && { category }),
          ...(status && { status })
        }).getQuery()
      );

      res.json({
        success: true,
        data: campaigns,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (error) {
      logger.error('Error fetching campaigns:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch campaigns',
        error: error.message
      });
    }
  }

  // Get single campaign by slug or ID
  async getCampaign(req, res) {
    try {
      const { identifier } = req.params;
      
      let campaign;
      if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        // It's a MongoDB ID
        campaign = await Campaign.findById(identifier)
          .populate('creator', 'username firstName lastName avatar isVerified bio')
          .populate('updates.author', 'username firstName lastName avatar');
      } else {
        // It's a slug
        campaign = await Campaign.findBySlug(identifier);
      }

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      // Increment view count
      await campaign.incrementViews();

      res.json({
        success: true,
        data: campaign
      });

    } catch (error) {
      logger.error('Error fetching campaign:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch campaign',
        error: error.message
      });
    }
  }

  // Update campaign
  async updateCampaign(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const campaign = await Campaign.findById(id);

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      // Check if user is the creator
      if (campaign.creator.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this campaign'
        });
      }

      // Don't allow certain fields to be updated if campaign is active
      const restrictedFields = ['fundingGoal', 'currency', 'deadline'];
      const isRestricted = restrictedFields.some(field => 
        req.body[field] && campaign.status === 'active'
      );

      if (isRestricted) {
        return res.status(400).json({
          success: false,
          message: 'Cannot modify funding goal, currency, or deadline for active campaigns'
        });
      }

      Object.assign(campaign, req.body);
      await campaign.save();

      res.json({
        success: true,
        message: 'Campaign updated successfully',
        data: campaign
      });

    } catch (error) {
      logger.error('Error updating campaign:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update campaign',
        error: error.message
      });
    }
  }

  // Delete campaign
  async deleteCampaign(req, res) {
    try {
      const { id } = req.params;
      const campaign = await Campaign.findById(id);

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      // Check if user is the creator
      if (campaign.creator.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this campaign'
        });
      }

      // Only allow deletion of draft campaigns or campaigns with no contributions
      if (campaign.status !== 'draft') {
        const contributionCount = await Contribution.countDocuments({ campaign: id });
        if (contributionCount > 0) {
          return res.status(400).json({
            success: false,
            message: 'Cannot delete campaign with existing contributions'
          });
        }
      }

      await Campaign.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Campaign deleted successfully'
      });

    } catch (error) {
      logger.error('Error deleting campaign:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete campaign',
        error: error.message
      });
    }
  }

  // Add campaign update
  async addUpdate(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const campaign = await Campaign.findById(id);

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      // Check if user is the creator
      if (campaign.creator.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to add updates to this campaign'
        });
      }

      const updateData = {
        ...req.body,
        author: req.user.id
      };

      await campaign.addUpdate(updateData);

      const updatedCampaign = await Campaign.findById(id)
        .populate('updates.author', 'username firstName lastName avatar');

      res.status(201).json({
        success: true,
        message: 'Update added successfully',
        data: updatedCampaign.updates[updatedCampaign.updates.length - 1]
      });

    } catch (error) {
      logger.error('Error adding campaign update:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add update',
        error: error.message
      });
    }
  }

  // Get campaign statistics
  async getCampaignStats(req, res) {
    try {
      const { id } = req.params;
      const campaign = await Campaign.findById(id);

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      const contributions = await Contribution.find({ campaign: id })
        .populate('contributor', 'username firstName lastName avatar')
        .sort({ createdAt: -1 });

      const stats = {
        totalContributions: contributions.length,
        uniqueContributors: campaign.stats.uniqueContributors,
        totalAmount: campaign.currentFunding,
        averageContribution: campaign.stats.averageContribution,
        recentContributions: contributions.slice(0, 10),
        dailyProgress: await this.calculateDailyProgress(id),
        topContributors: await this.getTopContributors(id)
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error('Error fetching campaign stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch campaign stats',
        error: error.message
      });
    }
  }

  // Helper methods
  async generateUniqueSlug(title) {
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    let uniqueSlug = slug;
    let counter = 1;

    while (await Campaign.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }

  async calculateDailyProgress(campaignId) {
    // This would calculate daily funding progress
    // Implementation depends on your data structure
    return [];
  }

  async getTopContributors(campaignId, limit = 5) {
    const contributions = await Contribution.aggregate([
      { $match: { campaign: mongoose.Types.ObjectId(campaignId) } },
      {
        $group: {
          _id: '$contributor',
          totalAmount: { $sum: '$amount' },
          contributionCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          username: '$user.username',
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          avatar: '$user.avatar',
          totalAmount: 1,
          contributionCount: 1
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: limit }
    ]);

    return contributions;
  }
}

module.exports = new CampaignController();
